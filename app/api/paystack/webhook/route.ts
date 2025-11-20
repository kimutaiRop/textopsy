import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { calculateProExpiry, getPlanManagementUrl } from "@/lib/billing";
import { formatAmountFromMinorUnits } from "@/lib/currency";
import { generateId } from "@/lib/conversation";
import { db, paystackTransactions, users } from "@/lib/db";
import { sendAutoRenewalNotificationEmail, sendPlanActivatedEmail } from "@/lib/email";

export async function POST(request: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const signature = request.headers.get("x-paystack-signature");
  const rawBody = await request.text();

  if (!secretKey || !signature) {
    return NextResponse.json({ error: "Missing Paystack configuration." }, { status: 400 });
  }

  const computedSignature = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");

  if (computedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const payload = safeJsonParse(rawBody);

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const eventName = payload.event;
  const data = payload.data;

  try {
    switch (eventName) {
      case "charge.success":
      case "invoice.payment_success":
        await handlePaymentSuccess(eventName, data);
        break;
      case "invoice.payment_failed":
        console.warn("[paystack:webhook] Invoice payment failed", data?.reference);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("[paystack:webhook] Handler error", error);
    return NextResponse.json({ error: "Failed to process webhook." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(eventName: string, data: any) {
  const metadata = data?.metadata ?? {};
  const userId = metadata.userId;
  const reference = data?.reference;

  if (!userId) {
    console.warn("[paystack:webhook] Missing userId in metadata", reference);
    return;
  }

  if (!reference) {
    console.warn("[paystack:webhook] Missing reference in payment data");
    return;
  }

  // Security: Check if transaction was already processed (idempotency)
  const [existingTransaction] = await db
    .select({ status: paystackTransactions.status, userId: paystackTransactions.userId })
    .from(paystackTransactions as any)
    .where(eq(paystackTransactions.reference, reference) as any)
    .limit(1);

  if (existingTransaction) {
    // Verify userId matches to prevent unauthorized access
    if (existingTransaction.userId !== userId) {
      console.error(
        `[paystack:webhook] UserId mismatch for reference ${reference}. Expected: ${existingTransaction.userId}, Received: ${userId}`
      );
      return;
    }

    // If already processed, skip (idempotency)
    if (existingTransaction.status === "success") {
      console.log(`[paystack:webhook] Transaction ${reference} already processed, skipping.`);
      return;
    }
  }

  // Security: Verify payment status is actually success
  if (data?.status !== "success") {
    console.warn(`[paystack:webhook] Payment status is not success for reference ${reference}`, data?.status);
    return;
  }

  const expiresAt = await calculateProExpiry();

  await db
    .update(users as any)
    .set({
      plan: "pro",
      planExpiresAt: expiresAt,
      paystackCustomerCode: data?.customer?.customer_code ?? null,
      paystackAuthorizationCode: data?.authorization?.authorization_code ?? null,
      updatedAt: new Date(),
      lastRenewalReminderAt: null,
    })
    .where(eq(users.id, userId) as any);

  await upsertTransactionRecord(userId, data);

  const email = data?.customer?.email ?? metadata.email;

  if (email) {
    await sendPlanActivatedEmail({
      email,
      planName: (metadata.plan as string) ?? "Pro",
      amount: formatAmountFromMinorUnits(data?.amount, data?.currency ?? "NGN"),
      reference: data?.reference,
      expiresAt: expiresAt.toUTCString(),
      manageUrl: getPlanManagementUrl(),
      isRenewal: eventName === "invoice.payment_success",
    });
  }

  if (eventName === "invoice.payment_success") {
    await sendAutoRenewalNotificationEmail({
      customerEmail: email ?? "unknown",
      planName: (metadata.plan as string) ?? "Pro",
      amount: formatAmountFromMinorUnits(data?.amount, data?.currency ?? "NGN"),
      reference: data?.reference,
      paidAt: data?.paid_at ?? data?.paidAt ?? null,
    });
  }
}

async function upsertTransactionRecord(userId: string, data: any) {
  if (!data?.reference) {
    return;
  }

  const [existing] = await db
    .select({ id: paystackTransactions.id })
    .from(paystackTransactions as any)
    .where(eq(paystackTransactions.reference, data.reference) as any)
    .limit(1);

  if (existing) {
    await db
      .update(paystackTransactions as any)
      .set({
        status: data?.status ?? "success",
        channel: data?.channel ?? null,
        metadata: data?.metadata ?? null,
        amount: data?.amount ?? 0,
        currency: data?.currency ?? "NGN",
        updatedAt: new Date(),
      })
      .where(eq(paystackTransactions.id, existing.id) as any);
    return;
  }

  await db.insert(paystackTransactions as any).values({
    id: generateId(),
    userId,
    reference: data.reference,
    authorizationUrl: data?.authorization_url ?? null,
    accessCode: data?.access_code ?? null,
    amount: data?.amount ?? 0,
    currency: data?.currency ?? "NGN",
    status: data?.status ?? "success",
    channel: data?.channel ?? null,
    metadata: data?.metadata ?? null,
  });
}

function safeJsonParse(payload: string) {
  try {
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
}


