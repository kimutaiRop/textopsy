'use server';

import "server-only";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export type PaystackInitializePayload = {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  planCode?: string | null;
  currency?: string;
};

export type PaystackInitializeResponse = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export type PaystackVerificationResponse = {
  status: string;
  amount: number;
  currency: string;
  customerCode?: string | null;
  authorizationCode?: string | null;
  paidAt?: string | null;
  channel?: string | null;
  metadata?: Record<string, unknown> | null;
};

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  return key;
}

export async function initializePaystackTransaction(
  payload: PaystackInitializePayload
): Promise<PaystackInitializeResponse> {
  const secretKey = getSecretKey();

  const body: Record<string, unknown> = {
    email: payload.email,
    amount: payload.amount,
    reference: payload.reference,
    callback_url: payload.callbackUrl,
    metadata: payload.metadata ?? {},
  };

  if (payload.planCode) {
    body.plan = payload.planCode;
  }

  if (payload.currency) {
    body.currency = payload.currency;
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.status) {
    throw new Error(
      data?.message || "Failed to initialize Paystack transaction"
    );
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerificationResponse> {
  const secretKey = getSecretKey();

  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.status) {
    throw new Error(data?.message || "Unable to verify Paystack transaction");
  }

  const tx = data.data;

  return {
    status: tx.status,
    amount: tx.amount,
    currency: tx.currency,
    customerCode: tx.customer?.customer_code ?? null,
    authorizationCode: tx.authorization?.authorization_code ?? null,
    paidAt: tx.paid_at ?? null,
    channel: tx.channel ?? null,
    metadata: tx.metadata ?? null,
  };
}

