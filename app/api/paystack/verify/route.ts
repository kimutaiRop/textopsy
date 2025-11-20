import { NextResponse } from "next/server";

import { getAuthTokenFromRequest, verifyToken } from "@/lib/auth";
import { calculateProExpiry, getPlanManagementUrl, getUserPlanInfo } from "@/lib/billing";
import { formatAmountFromMinorUnits } from "@/lib/currency";
import { db, paystackTransactions, users } from "@/lib/db";
import { sendPlanActivatedEmail } from "@/lib/email";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const authUser = verifyToken(token);
  if (!authUser) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
  }

  const { reference } = await request.json().catch(() => ({ reference: null }));
  if (!reference || typeof reference !== "string") {
    return NextResponse.json({ error: "Payment reference is required." }, { status: 400 });
  }

  const [transaction] = await db
    .select()
    .from(paystackTransactions as any)
    .where(eq(paystackTransactions.reference, reference) as any)
    .limit(1);

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  }

  if (transaction.userId !== authUser.id) {
    return NextResponse.json(
      { error: "You are not allowed to verify this transaction." },
      { status: 403 }
    );
  }

  // Prevent re-processing already successful transactions (idempotency)
  if (transaction.status === "success") {
    const planInfo = await getUserPlanInfo(authUser.id);
    return NextResponse.json({
      success: true,
      plan: planInfo?.plan ?? "free",
      planExpiresAt: planInfo?.planExpiresAt ? planInfo.planExpiresAt.toISOString() : null,
      message: "Transaction already processed.",
    });
  }

  try {
    const verification = await verifyPaystackTransaction(reference);

    if (verification.status !== "success") {
      return NextResponse.json(
        { error: "Payment not completed yet. Please finish the Paystack flow." },
        { status: 400 }
      );
    }

    // Security: Verify payment amount matches expected amount (prevent amount tampering)
    const expectedAmount = transaction.amount;
    if (verification.amount !== expectedAmount) {
      console.error(
        `[paystack:verify] Amount mismatch for reference ${reference}. Expected: ${expectedAmount}, Received: ${verification.amount}`
      );
      return NextResponse.json(
        { error: "Payment amount mismatch. Please contact support." },
        { status: 400 }
      );
    }

    // Security: Verify currency matches expected currency
    const expectedCurrency = transaction.currency?.toUpperCase() ?? "NGN";
    const receivedCurrency = verification.currency?.toUpperCase() ?? "NGN";
    if (receivedCurrency !== expectedCurrency) {
      console.error(
        `[paystack:verify] Currency mismatch for reference ${reference}. Expected: ${expectedCurrency}, Received: ${receivedCurrency}`
      );
      return NextResponse.json(
        { error: "Payment currency mismatch. Please contact support." },
        { status: 400 }
      );
    }

    // Security: Check if user is already Pro (prevent duplicate upgrades)
    const currentPlanInfo = await getUserPlanInfo(authUser.id);
    if (currentPlanInfo?.isPro) {
      // User already has Pro plan, just update transaction status
      await db
        .update(paystackTransactions as any)
        .set({
          status: verification.status,
          channel: verification.channel ?? transaction.channel,
          metadata: verification.metadata ?? transaction.metadata,
          updatedAt: new Date(),
        })
        .where(eq(paystackTransactions.reference, reference) as any);

      return NextResponse.json({
        success: true,
        plan: currentPlanInfo.plan,
        planExpiresAt: currentPlanInfo.planExpiresAt ? currentPlanInfo.planExpiresAt.toISOString() : null,
        message: "You already have an active Pro plan.",
      });
    }

    const expiresAt = await calculateProExpiry();

    await db
      .update(users as any)
      .set({
        plan: "pro",
        planExpiresAt: expiresAt,
        paystackCustomerCode: verification.customerCode ?? transaction.metadata?.customerCode ?? null,
        paystackAuthorizationCode: verification.authorizationCode ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, authUser.id) as any);

    await db
      .update(paystackTransactions as any)
      .set({
        status: verification.status,
        channel: verification.channel ?? transaction.channel,
        metadata: verification.metadata ?? transaction.metadata,
        updatedAt: new Date(),
      })
      .where(eq(paystackTransactions.reference, reference) as any);

    const planInfo = await getUserPlanInfo(authUser.id);
    if (planInfo) {
      sendPlanActivatedEmail({
        email: planInfo.email,
        planName: "Pro",
        amount: formatAmountFromMinorUnits(verification.amount, verification.currency ?? "NGN"),
        reference,
        expiresAt: expiresAt.toUTCString(),
        manageUrl: getPlanManagementUrl(),
      }).catch((error) => {
        console.error("[paystack:verify] Failed to send activation email", error);
      });
    }

    return NextResponse.json({
      success: true,
      plan: "pro",
      planExpiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


