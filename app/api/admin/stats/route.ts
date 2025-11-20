import { NextResponse } from "next/server";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { conversations, db, users, userMonthlyCredits } from "@/lib/db";
import { getUsageMonthKey, normalizePlan } from "@/lib/billing";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const usageMonth = await getUsageMonthKey();

    // Total users count
    const [{ count: totalUsers }] = await db
      .select({ count: count() })
      .from(users as any);

    // Pro users count (active)
    const proUsersRows = await db
      .select({ id: users.id, plan: users.plan, planExpiresAt: users.planExpiresAt })
      .from(users as any)
      .where(eq(users.plan, "pro") as any);

    let proUsersCount = 0;
    const now = new Date();
    for (const row of proUsersRows) {
      const normalized = await normalizePlan(row.plan, row.planExpiresAt);
      if (normalized.isPro) {
        proUsersCount++;
      }
    }

    const freeUsersCount = Number(totalUsers ?? 0) - proUsersCount;

    // Total conversations
    const [{ count: totalConversations }] = await db
      .select({ count: count() })
      .from(conversations as any);

    // Users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
    
    const [{ count: recentUsers }] = await db
      .select({ count: count() })
      .from(users as any)
      .where(gte(users.createdAt, thirtyDaysAgo) as any);

    // Total credits used this month
    const creditsRows = await db
      .select({
        creditsUsed: userMonthlyCredits.creditsUsed,
      })
      .from(userMonthlyCredits as any)
      .where(eq(userMonthlyCredits.usageMonth, usageMonth) as any);

    const totalCreditsUsed = creditsRows.reduce((sum, row) => sum + (row.creditsUsed ?? 0), 0);

    return NextResponse.json({
      stats: {
        totalUsers: Number(totalUsers ?? 0),
        proUsers: proUsersCount,
        freeUsers: freeUsersCount,
        totalConversations: Number(totalConversations ?? 0),
        recentUsers: Number(recentUsers ?? 0),
        totalCreditsUsed,
        usageMonth,
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

