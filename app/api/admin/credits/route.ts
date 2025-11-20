import { NextResponse } from "next/server";
import { and, asc, eq, sql } from "drizzle-orm";

import { conversations, db, userMonthlyCredits, users } from "@/lib/db";
import { getUsageMonthKey, normalizePlan, PRO_MAX_CREDITS_PER_MONTH } from "@/lib/billing";

export async function GET(request: Request) {
  const adminToken = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!adminToken) {
    return NextResponse.json(
      { error: "ADMIN_DASHBOARD_TOKEN is not configured on the server." },
      { status: 500 }
    );
  }

  const providedToken = request.headers.get("x-admin-token");
  if (!providedToken || providedToken !== adminToken) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const usageMonth = await getUsageMonthKey();

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      plan: users.plan,
      planExpiresAt: users.planExpiresAt,
      createdAt: users.createdAt,
      creditsUsed: userMonthlyCredits.creditsUsed,
      creditsUpdatedAt: userMonthlyCredits.updatedAt,
      conversationsCount: sql<number>`COUNT(${conversations.id})`,
    })
    .from(users as any)
    .leftJoin(
      userMonthlyCredits as any,
      and(eq(userMonthlyCredits.userId, users.id), eq(userMonthlyCredits.usageMonth, usageMonth)) as any
    )
    .leftJoin(conversations as any, eq(conversations.userId, users.id) as any)
    .groupBy(
      users.id,
      users.email,
      users.plan,
      users.planExpiresAt,
      users.createdAt,
      userMonthlyCredits.creditsUsed,
      userMonthlyCredits.updatedAt
    )
    .orderBy(asc(users.createdAt));

  const usersWithPlan = await Promise.all(
    rows.map(async (row) => {
      const normalized = await normalizePlan(row.plan, row.planExpiresAt);
      const creditsUsed = row.creditsUsed ?? 0;

      return {
        id: row.id,
        email: row.email,
        plan: normalized.plan,
        isPro: normalized.isPro,
        planExpiresAt: normalized.planExpiresAt ? normalized.planExpiresAt.toISOString() : null,
        creditsUsed: normalized.isPro ? creditsUsed : 0,
        creditsRemaining: normalized.isPro ? Math.max(PRO_MAX_CREDITS_PER_MONTH - creditsUsed, 0) : null,
        conversations: Number(row.conversationsCount ?? 0),
        createdAt: row.createdAt?.toISOString() ?? null,
        lastCreditUpdate: row.creditsUpdatedAt ? row.creditsUpdatedAt.toISOString() : null,
      };
    })
  );

  return NextResponse.json({
    usageMonth,
    proCreditLimit: PRO_MAX_CREDITS_PER_MONTH,
    users: usersWithPlan,
    generatedAt: new Date().toISOString(),
  });
}


