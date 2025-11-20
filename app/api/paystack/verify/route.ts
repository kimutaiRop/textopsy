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

  try {
    const verification = await verifyPaystackTransaction(reference);

    if (verification.status !== "success") {
      return NextResponse.json(
        { error: "Payment not completed yet. Please finish the Paystack flow." },
        { status: 400 }
      );
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


