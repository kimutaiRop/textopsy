import { NextResponse } from "next/server";
import { avg, count, desc, eq, gte } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { analyses, conversations, db, users } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const days = Number.parseInt(searchParams.get("days") || "30", 10);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - days);
    startDate.setUTCHours(0, 0, 0, 0);

    // First get conversations
    const convs = await db
      .select({
        id: conversations.id,
        sessionId: conversations.sessionId,
        title: conversations.title,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        userId: conversations.userId,
        userEmail: users.email,
      })
      .from(conversations as any)
      .leftJoin(users as any, eq(conversations.userId, users.id) as any)
      .where(gte(conversations.createdAt, startDate) as any)
      .orderBy(desc(conversations.createdAt))
      .limit(limit)
      .offset(offset);

    // Then get aggregated analysis data for each conversation
    const convsWithAnalytics = await Promise.all(
      convs
        .filter((conv) => conv.id != null)
        .map(async (conv) => {
          const analysisData = await db
            .select({
              count: count(),
              avgCringe: avg(analyses.cringeScore),
              avgInterest: avg(analyses.interestLevel),
            })
            .from(analyses as any)
            .where(eq(analyses.conversationId, conv.id!) as any);

        const data = analysisData[0];
        return {
          ...conv,
          analysisCount: Number(data?.count ?? 0),
          avgCringeScore: data?.avgCringe ? Number(Number(data.avgCringe).toFixed(2)) : null,
          avgInterestLevel: data?.avgInterest ? Number(Number(data.avgInterest).toFixed(2)) : null,
        };
      })
    );

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(conversations as any)
      .where(gte(conversations.createdAt, startDate) as any);

    const totalCount = Number(totalCountResult[0]?.count ?? 0);

    // Format response - only non-sensitive aggregated data
    const formattedConversations = convsWithAnalytics.map((conv) => ({
      id: conv.id,
      sessionId: conv.sessionId,
      title: conv.title,
      createdAt: conv.createdAt?.toISOString() ?? null,
      updatedAt: conv.updatedAt?.toISOString() ?? null,
      userId: conv.userId,
      userEmail: conv.userEmail,
      analysisCount: conv.analysisCount,
      avgCringeScore: conv.avgCringeScore,
      avgInterestLevel: conv.avgInterestLevel,
    }));

    return NextResponse.json({
      conversations: formattedConversations,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
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

