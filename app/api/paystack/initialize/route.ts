import { NextResponse } from "next/server";

import { getAuthTokenFromRequest, verifyToken } from "@/lib/auth";
import { db, paystackTransactions } from "@/lib/db";
import { generateId } from "@/lib/conversation";
import { getUserPlanInfo } from "@/lib/billing";
import { initializePaystackTransaction } from "@/lib/paystack";

const DEFAULT_PRO_AMOUNT_MINOR_UNITS = 650 * 100; // 650 KES

export async function POST(request: Request) {
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const authUser = verifyToken(token);
  if (!authUser) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
  }

  const planInfo = await getUserPlanInfo(authUser.id);
  if (!planInfo) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (planInfo.isPro) {
    return NextResponse.json({ error: "You already have an active Pro plan." }, { status: 400 });
  }

  const rawAmount = Number(
    process.env.PAYSTACK_PRO_AMOUNT_MINOR ??
      process.env.PAYSTACK_PRO_AMOUNT_KOBO ??
      DEFAULT_PRO_AMOUNT_MINOR_UNITS
  );
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    return NextResponse.json(
      {
        error:
          "PAYSTACK_PRO_AMOUNT_MINOR (or legacy PAYSTACK_PRO_AMOUNT_KOBO) must be a positive integer in the currency's minor units.",
      },
      { status: 500 }
    );
  }

  const configuredCurrency =
    process.env.PAYSTACK_CURRENCY ?? (process.env.PAYSTACK_PRO_AMOUNT_KOBO ? "NGN" : "USD");
  const currency = configuredCurrency.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(currency)) {
    return NextResponse.json(
      { error: "PAYSTACK_CURRENCY must be a valid 3-letter ISO currency code (e.g. USD, NGN, KES)." },
      { status: 500 }
    );
  }

  const callbackUrl =
    process.env.PAYSTACK_CALLBACK_URL ??
    (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/paystack/callback`
      : null);

  if (!callbackUrl) {
    return NextResponse.json(
      { error: "Set PAYSTACK_CALLBACK_URL or NEXT_PUBLIC_APP_URL for Paystack redirects." },
      { status: 500 }
    );
  }

  const reference = `TXT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

  try {
    const payload = await initializePaystackTransaction({
      email: planInfo.email,
      amount: rawAmount,
      reference,
      callbackUrl,
      metadata: {
        userId: planInfo.id,
        email: planInfo.email,
        plan: "pro",
      },
      planCode: process.env.PAYSTACK_PLAN_CODE ?? null,
      currency,
    });

    await db.insert(paystackTransactions as any).values({
      id: generateId(),
      userId: planInfo.id,
      reference: payload.reference,
      authorizationUrl: payload.authorizationUrl,
      accessCode: payload.accessCode,
      amount: rawAmount,
      currency,
      status: "pending",
      metadata: {
        plan: "pro",
      },
    });

    return NextResponse.json({
      authorizationUrl: payload.authorizationUrl,
      reference: payload.reference,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to initialize Paystack checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

