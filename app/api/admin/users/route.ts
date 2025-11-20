import { NextResponse } from "next/server";
import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { conversations, db, userMonthlyCredits, users } from "@/lib/db";
import { getUsageMonthKey, normalizePlan, PRO_MAX_CREDITS_PER_MONTH } from "@/lib/billing";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const planFilter = searchParams.get("plan") || "";
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    const usageMonth = await getUsageMonthKey();

    // Build query conditions
    const conditions: any[] = [];
    if (search) {
      conditions.push(ilike(users.email, `%${search}%`) as any);
    }
    if (planFilter === "pro") {
      conditions.push(eq(users.plan, "pro") as any);
    } else if (planFilter === "free") {
      conditions.push(or(eq(users.plan, "free"), eq(users.plan, null)) as any);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        plan: users.plan,
        planExpiresAt: users.planExpiresAt,
        createdAt: users.createdAt,
        emailVerifiedAt: users.emailVerifiedAt,
        creditsUsed: userMonthlyCredits.creditsUsed,
        creditsUpdatedAt: userMonthlyCredits.updatedAt,
        conversationsCount: sql<number>`COUNT(DISTINCT ${conversations.id})`,
      })
      .from(users as any)
      .leftJoin(
        userMonthlyCredits as any,
        and(eq(userMonthlyCredits.userId, users.id), eq(userMonthlyCredits.usageMonth, usageMonth)) as any
      )
      .leftJoin(conversations as any, eq(conversations.userId, users.id) as any)
      .where(whereClause as any)
      .groupBy(
        users.id,
        users.email,
        users.plan,
        users.planExpiresAt,
        users.createdAt,
        users.emailVerifiedAt,
        userMonthlyCredits.creditsUsed,
        userMonthlyCredits.updatedAt
      )
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db
      .select({ count: count() })
      .from(users as any)
      .where(whereClause as any);
    
    const totalCount = totalCountResult[0]?.count ?? 0;

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
          emailVerifiedAt: row.emailVerifiedAt?.toISOString() ?? null,
          lastCreditUpdate: row.creditsUpdatedAt ? row.creditsUpdatedAt.toISOString() : null,
        };
      })
    );

    return NextResponse.json({
      users: usersWithPlan,
      pagination: {
        page,
        limit,
        total: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / limit),
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

