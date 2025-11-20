import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { decodeEmailVerificationToken } from "@/lib/auth";
import { db, users } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return respond(request, { success: false, message: "Verification token is required." }, 400);
  }

  const decoded = decodeEmailVerificationToken(token);

  if (!decoded) {
    return respond(request, { success: false, message: "Invalid or expired verification token." }, 400);
  }

  const [existing] = await db
    .select({
      id: users.id,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(users as any)
    .where(eq(users.id, decoded.id) as any)
    .limit(1);

  if (!existing) {
    return respond(request, { success: false, message: "Account not found." }, 404);
  }

  if (!existing.emailVerifiedAt) {
    await db
      .update(users as any)
      .set({
        emailVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, decoded.id) as any);
  }

  return respond(request, { success: true, message: "Email verified." }, 302);
}

function respond(request: Request, body: { success: boolean; message: string }, status: number) {
  const redirectTarget = getRedirectUrl(body.success ? "success" : "error", request);

  if (redirectTarget) {
    const url = new URL(redirectTarget);
    url.searchParams.set("message", body.message);
    return NextResponse.redirect(url, { status: body.success ? 302 : status });
  }

  return NextResponse.json(body, { status });
}

function getRedirectUrl(outcome: "success" | "error", request: Request) {
  const envOverride =
    outcome === "success"
      ? process.env.EMAIL_VERIFICATION_SUCCESS_REDIRECT
      : process.env.EMAIL_VERIFICATION_ERROR_REDIRECT;

  if (envOverride) {
    return envOverride;
  }

  const fallbackBase =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(request.url).origin;

  const fallbackPath = outcome === "success" ? "/verify-email?status=success" : "/verify-email?status=error";

  return `${fallbackBase}${fallbackPath}`;
}


