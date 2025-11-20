import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { db, users } from "@/lib/db";
import { calculateProExpiry } from "@/lib/billing";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin(request);

    const { userId } = await params;
    const body = await request.json();
    const { plan, durationDays } = body;

    if (!plan || !["free", "pro"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'free' or 'pro'" },
        { status: 400 }
      );
    }

    // Get user to verify they exist
    const [user] = await db
      .select()
      .from(users as any)
      .where(eq(users.id, userId) as any)
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user plan
    const updateData: any = {
      plan,
      updatedAt: new Date(),
    };

    if (plan === "pro") {
      const days = durationDays ? Number.parseInt(String(durationDays), 10) : 30;
      if (days > 0) {
        updateData.planExpiresAt = await calculateProExpiry(new Date());
        // Adjust expiration based on duration
        const expirationDate = new Date();
        expirationDate.setUTCDate(expirationDate.getUTCDate() + days);
        updateData.planExpiresAt = expirationDate;
      } else {
        // No expiration (lifetime pro)
        updateData.planExpiresAt = null;
      }
    } else {
      // Free plan - clear expiration
      updateData.planExpiresAt = null;
    }

    await db
      .update(users as any)
      .set(updateData)
      .where(eq(users.id, userId) as any);

    // Fetch updated user
    const [updatedUser] = await db
      .select()
      .from(users as any)
      .where(eq(users.id, userId) as any)
      .limit(1);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        plan: updatedUser.plan,
        planExpiresAt: updatedUser.planExpiresAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

