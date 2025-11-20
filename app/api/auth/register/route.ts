import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import {
  generateEmailVerificationToken,
  generateToken,
  getEmailVerificationTtlHours,
  hashPassword,
} from "@/lib/auth";
import { normalizePlan } from "@/lib/billing";
import { generateId } from "@/lib/conversation";
import { db, users } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { GenderOption } from "@/types/analysis";

export async function POST(request: Request) {
  try {
    const { email, password, gender } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate gender if provided
    if (gender && !Object.values(GenderOption).includes(gender)) {
      return NextResponse.json(
        { error: "Invalid gender value" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existingUser] = await db
        .select()
        .from(users as any)
      .where(eq(users.email, normalizedEmail) as any)
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const passwordHash = await hashPassword(password);
    const userId = generateId();

    await db.insert(users).values({
        id: userId,
      email: normalizedEmail,
        passwordHash,
        gender: gender || null,
    });

    // Generate token
    const token = generateToken({ id: userId, email: normalizedEmail });

    const normalizedPlan = await normalizePlan("free", null);

    const verificationToken = generateEmailVerificationToken({ id: userId, email: normalizedEmail });
    const verificationUrl = buildVerificationUrl(request, verificationToken);

    sendVerificationEmail({
      email: normalizedEmail,
      verificationUrl,
      expiresInHours: getEmailVerificationTtlHours(),
    }).catch((error) => {
      console.error("[register] Failed to send verification email", error);
    });

    return NextResponse.json({
      token,
      user: {
        id: userId,
        email: normalizedEmail,
        plan: normalizedPlan.plan,
        planExpiresAt: null,
        isPro: normalizedPlan.isPro,
        emailVerifiedAt: null,
        isEmailVerified: false,
        gender: gender || null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

function buildVerificationUrl(request: Request, token: string) {
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    request.headers.get("origin") ||
    new URL(request.url).origin;

  return `${origin}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
}

