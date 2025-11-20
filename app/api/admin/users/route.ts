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
      conditions.push(eq(users.plan, "free") as any);
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
        conversationsCount: sql<number>`COUNT(DISTINCT ${conversations.id})`.as("conversationsCount"),
      } as any)
      .from(users as any)
      .leftJoin(
        userMonthlyCredits as any,
        and(eq(userMonthlyCredits.userId, users.id), eq(userMonthlyCredits.usageMonth, usageMonth)) as any
      )
      .leftJoin(conversations as any, eq(conversations.userId, users.id) as any)
      .where(whereClause as any)
      .groupBy(
        users.id as any,
        users.email as any,
        users.plan as any,
        users.planExpiresAt as any,
        users.createdAt as any,
        users.emailVerifiedAt as any,
        userMonthlyCredits.creditsUsed as any,
        userMonthlyCredits.updatedAt as any
      )
      .orderBy(desc(users.createdAt) as any)
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db
      .select({ count: count() } as any)
      .from(users as any)
      .where(whereClause as any);
    
    const totalCount = totalCountResult[0]?.count ?? 0;

    const usersWithPlan = await Promise.all(
      rows.map(async (row: any) => {
        const normalized = await normalizePlan(row.plan as string, row.planExpiresAt as Date | null);
        const creditsUsed = (row.creditsUsed as number | null) ?? 0;
        const conversationsCount = (row.conversationsCount as number | null) ?? 0;

        return {
          id: row.id as string,
          email: row.email as string,
          plan: normalized.plan,
          isPro: normalized.isPro,
          planExpiresAt: normalized.planExpiresAt ? normalized.planExpiresAt.toISOString() : null,
          creditsUsed: normalized.isPro ? creditsUsed : 0,
          creditsRemaining: normalized.isPro ? Math.max(PRO_MAX_CREDITS_PER_MONTH - creditsUsed, 0) : null,
          conversations: Number(conversationsCount),
          createdAt: (row.createdAt as Date | null)?.toISOString() ?? null,
          emailVerifiedAt: (row.emailVerifiedAt as Date | null)?.toISOString() ?? null,
          lastCreditUpdate: (row.creditsUpdatedAt as Date | null) ? (row.creditsUpdatedAt as Date).toISOString() : null,
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

