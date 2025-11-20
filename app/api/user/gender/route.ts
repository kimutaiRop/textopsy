import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { verifyToken, getAuthTokenFromRequest } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { GenderOption } from "@/types/analysis";

export async function PATCH(request: Request) {
  try {
    const token = getAuthTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { gender } = await request.json();

    // Validate gender if provided
    if (gender && !Object.values(GenderOption).includes(gender)) {
      return NextResponse.json(
        { error: "Invalid gender value" },
        { status: 400 }
      );
    }

    await db
      .update(users as any)
      .set({
        gender: gender || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id) as any);

    return NextResponse.json({
      success: true,
      gender: gender || null,
    });
  } catch (error) {
    console.error("Update gender error:", error);
    return NextResponse.json(
      { error: "Failed to update gender" },
      { status: 500 }
    );
  }
}

