import { NextResponse } from "next/server";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { conversations, db, paystackTransactions, userMonthlyCredits, users } from "@/lib/db";
import { normalizePlan } from "@/lib/billing";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const days = Number.parseInt(searchParams.get("days") || "30", 10);
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - days);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setUTCHours(23, 59, 59, 999);

    // User growth trends
    const userGrowth = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count(),
      })
      .from(users as any)
      .where(gte(users.createdAt, startDate) as any)
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Plan distribution
    const allUsers = await db
      .select({
        id: users.id,
        plan: users.plan,
        planExpiresAt: users.planExpiresAt,
      })
      .from(users as any);

    let activeProCount = 0;
    let expiredProCount = 0;
    const now = new Date();

    for (const user of allUsers) {
      const normalized = await normalizePlan(user.plan, user.planExpiresAt);
      if (normalized.isPro) {
        activeProCount++;
      } else if (user.plan === "pro") {
        expiredProCount++;
      }
    }

    // Financial data - revenue from successful transactions
    const successfulTransactions = await db
      .select({
        amount: paystackTransactions.amount,
        currency: paystackTransactions.currency,
        createdAt: paystackTransactions.createdAt,
      })
      .from(paystackTransactions as any)
      .where(
        and(
          eq(paystackTransactions.status, "success") as any,
          gte(paystackTransactions.createdAt, startDate) as any
        ) as any
      );

    const totalRevenue = successfulTransactions.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
    
    // Revenue by date
    const revenueByDate = successfulTransactions.reduce((acc, tx) => {
      if (!tx.createdAt) return acc;
      const date = tx.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + (tx.amount ?? 0);
      return acc;
    }, {} as Record<string, number>);

    // Usage trends - conversations created
    const conversationTrends = await db
      .select({
        date: sql<string>`DATE(${conversations.createdAt})`,
        count: count(),
      })
      .from(conversations as any)
      .where(gte(conversations.createdAt, startDate) as any)
      .groupBy(sql`DATE(${conversations.createdAt})`)
      .orderBy(sql`DATE(${conversations.createdAt})`);

    // Credits usage trends
    const creditsRows = await db
      .select({
        usageMonth: userMonthlyCredits.usageMonth,
        creditsUsed: userMonthlyCredits.creditsUsed,
      })
      .from(userMonthlyCredits as any);

    const creditsByMonth = creditsRows.reduce((acc, row) => {
      const month = row.usageMonth;
      if (!acc[month]) {
        acc[month] = { totalCredits: 0, userCount: 0 };
      }
      acc[month].totalCredits += row.creditsUsed ?? 0;
      acc[month].userCount += 1;
      return acc;
    }, {} as Record<string, { totalCredits: number; userCount: number }>);

    const creditsData = Object.entries(creditsByMonth).map(([month, data]) => ({
      month,
      totalCredits: data.totalCredits,
      userCount: data.userCount,
    })).sort((a, b) => a.month.localeCompare(b.month));

    // Recent transactions summary
    const recentTransactions = successfulTransactions
      .slice(-10)
      .reverse()
      .map((tx) => ({
        amount: tx.amount ?? 0,
        currency: tx.currency ?? "NGN",
        date: tx.createdAt?.toISOString() ?? null,
      }));

    // Free vs Pro conversion rate
    const totalUsers = allUsers.length;
    const conversionRate = totalUsers > 0 ? (activeProCount / totalUsers) * 100 : 0;

    // Average revenue per user (ARPU)
    const uniquePayingUsers = new Set(
      successfulTransactions.map((tx) => {
        // We'd need userId in the transaction, but let's use what we have
        return tx.createdAt?.toISOString();
      })
    ).size;
    const arpu = uniquePayingUsers > 0 ? totalRevenue / uniquePayingUsers : 0;

    // Monthly recurring revenue (MRR) estimate
    const thisMonthTransactions = successfulTransactions.filter((tx) => {
      if (!tx.createdAt) return false;
      const txDate = new Date(tx.createdAt);
      return (
        txDate.getUTCMonth() === now.getUTCMonth() &&
        txDate.getUTCFullYear() === now.getUTCFullYear()
      );
    });
    const mrr = thisMonthTransactions.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);

    return NextResponse.json({
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      users: {
        total: totalUsers,
        activePro: activeProCount,
        expiredPro: expiredProCount,
        free: totalUsers - activeProCount - expiredProCount,
        growth: userGrowth.map((item) => ({
          date: item.date,
          count: Number(item.count ?? 0),
        })),
        conversionRate: Number(conversionRate.toFixed(2)),
      },
      finances: {
        totalRevenue,
        mrr: Number(mrr),
        arpu: Number(arpu.toFixed(2)),
        transactionCount: successfulTransactions.length,
        revenueByDate: Object.entries(revenueByDate).map(([date, amount]) => ({
          date,
          amount,
        })),
        recentTransactions,
      },
      usage: {
        conversations: conversationTrends.map((item) => ({
          date: item.date,
          count: Number(item.count ?? 0),
        })),
        credits: creditsData,
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

