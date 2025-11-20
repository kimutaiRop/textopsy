import { NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { normalizePlan } from "@/lib/billing";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.error("[LOGIN] Attempting login for:", email.toLowerCase().trim());

    // Find user
    let user;
    try {
      const userResults = await db
        .select()
        .from(users as any)
        .where(eq(users.email, email.toLowerCase().trim()) as any)
        .limit(1);
      
      user = userResults[0];
      console.error("[LOGIN] User query result:", user ? "found" : "not found");
    } catch (dbError) {
      console.error("[LOGIN] Database query error:", dbError);
      return NextResponse.json(
        { error: "Database error. Please try again." },
        { status: 500 }
      );
    }

    if (!user) {
      console.error("[LOGIN] User not found");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      console.error("[LOGIN] Invalid password");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email });
    console.error("[LOGIN] Login successful");

    const normalizedPlan = await normalizePlan(user.plan, user.planExpiresAt);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        plan: normalizedPlan.plan,
        planExpiresAt: normalizedPlan.planExpiresAt
          ? normalizedPlan.planExpiresAt.toISOString()
          : null,
        isPro: normalizedPlan.isPro,
        emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
        isEmailVerified: Boolean(user.emailVerifiedAt),
      },
    });
  } catch (error) {
    console.error("[LOGIN] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to login" },
      { status: 500 }
    );
  }
}

