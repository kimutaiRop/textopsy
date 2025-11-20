import { NextResponse } from "next/server";
import { db, conversations, analyses, conversationInputs, type Conversation } from "@/lib/db";
import { eq, desc, count } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL;

export async function GET(request: Request) {
  const startTime = Date.now();
  console.error("📋 [CONVERSATIONS] ========== REQUEST RECEIVED ==========");
  console.error("📋 [CONVERSATIONS] Time:", new Date().toISOString());

  if (!databaseUrl) {
    console.error("⚠️ [CONVERSATIONS] No DATABASE_URL, returning empty array");
    return NextResponse.json({ conversations: [] });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    console.error("📋 [CONVERSATIONS] Fetching conversations for session:", sessionId);

    // Get all conversations for session
    const allConversations = (await db
        .select()
        .from(conversations as any)
        .where(eq(conversations.sessionId, sessionId) as any)
      .orderBy(desc(conversations.updatedAt) as any)) as Conversation[];
    console.error("✅ [CONVERSATIONS] Found", allConversations.length, "conversations");

    // For each conversation, get counts and most recent analysis
    console.log("📋 [CONVERSATIONS] Loading details for", allConversations.length, "conversations...");
    
    const conversationsWithDetails = await Promise.all(
      allConversations.map(async (conv: Conversation, index: number) => {
        try {
          console.log(`📋 [CONVERSATIONS] Loading details ${index + 1}/${allConversations.length}...`);
          
          // Get analysis count
          const [{ count: analysisCount }] = await db
            .select({ count: count() as any })
            .from(analyses as any)
            .where(eq(analyses.conversationId, conv.id) as any);

          // Get input count
          const [{ count: inputCount }] = await db
              .select({ count: count() as any })
              .from(conversationInputs as any)
            .where(eq(conversationInputs.conversationId, conv.id) as any);

          // Get most recent analysis for preview
          const [latestAnalysis] = await db
            .select({
              id: analyses.id,
              diagnosis: analyses.diagnosis,
              persona: analyses.persona,
              createdAt: analyses.createdAt,
            } as any)
              .from(analyses as any)
              .where(eq(analyses.conversationId, conv.id) as any)
              .orderBy(desc(analyses.createdAt) as any)
            .limit(1);

          return {
            ...conv,
            analyses: latestAnalysis ? [latestAnalysis] : [],
            _count: {
              analyses: Number(analysisCount),
              inputs: Number(inputCount),
            },
          };
        } catch (convError) {
          console.error(`❌ [CONVERSATIONS] Error loading conversation ${conv.id}:`, convError);
          // Return minimal data if details fail
          return {
            ...conv,
            analyses: [],
            _count: { analyses: 0, inputs: 0 },
          };
        }
      })
    );

    const elapsed = Date.now() - startTime;
    console.error(`✅ [CONVERSATIONS] ========== REQUEST COMPLETE ========== ${elapsed}ms`);
    return NextResponse.json({ conversations: conversationsWithDetails });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ [CONVERSATIONS] ========== REQUEST FAILED ==========`);
    console.error(`❌ [CONVERSATIONS] Failed after ${elapsed}ms:`, error);
    console.error("❌ [CONVERSATIONS] Error stack:", error instanceof Error ? error.stack : "No stack");
    
    return NextResponse.json({ error: "Failed to fetch conversations." }, { status: 500 });
  }
}

