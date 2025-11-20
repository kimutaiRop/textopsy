import { NextResponse } from "next/server";
import { db, conversations, analyses, conversationInputs, chatMessages } from "@/lib/db";
import { getSessionIdFromRequest } from "@/lib/conversation";
import { eq, desc, asc } from "drizzle-orm";
import type { ConversationContext } from "@/types/analysis";

const databaseUrl = process.env.DATABASE_URL;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!databaseUrl) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const sessionId = getSessionIdFromRequest(request);
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const [conversation] = await db
      .select()
      .from(conversations as any)
      .where(eq(conversations.id, id) as any)
      .limit(1);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.sessionId !== sessionId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all analyses for this conversation
    const conversationAnalyses = await db
      .select()
      .from(analyses as any)
      .where(eq(analyses.conversationId, id) as any)
      .orderBy(desc(analyses.createdAt) as any);

    // Get all inputs for this conversation
    const conversationInputsList = await db
      .select()
      .from(conversationInputs as any)
      .where(eq(conversationInputs.conversationId, id) as any)
      .orderBy(asc(conversationInputs.order) as any);

    // Get all chat messages for this conversation (if table exists)
    let conversationChatMessages: any[] = [];
    try {
      conversationChatMessages = await db
        .select()
        .from(chatMessages as any)
        .where(eq(chatMessages.conversationId, id) as any)
        .orderBy(asc(chatMessages.createdAt) as any);
    } catch (chatError) {
      // Table might not exist yet - return empty array
      console.warn("Chat messages table might not exist yet:", chatError);
      conversationChatMessages = [];
    }

    return NextResponse.json({
      conversation: {
        ...conversation,
        analyses: conversationAnalyses,
        inputs: conversationInputsList,
        chatMessages: conversationChatMessages,
      },
    });
  } catch (error) {
    console.error("Failed to fetch conversation:", error);
    return NextResponse.json({ error: "Failed to fetch conversation." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!databaseUrl) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const sessionId = getSessionIdFromRequest(request);
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [conversation] = await db
      .select()
      .from(conversations as any)
      .where(eq(conversations.id, id) as any)
      .limit(1);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.sessionId !== sessionId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    // Delete related records first (cascade delete)
    await db.delete(analyses as any).where(eq(analyses.conversationId, id) as any);
    await db.delete(conversationInputs as any).where(eq(conversationInputs.conversationId, id) as any);
    await db.delete(chatMessages as any).where(eq(chatMessages.conversationId, id) as any);
    
    // Delete the conversation
    await db.delete(conversations as any).where(eq(conversations.id, id) as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return NextResponse.json({ error: "Failed to delete conversation." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!databaseUrl) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const sessionId = getSessionIdFromRequest(request);
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const context = (body?.context ?? null) as ConversationContext | null;

    const [conversation] = await db
      .select()
      .from(conversations as any)
      .where(eq(conversations.id, id) as any)
      .limit(1);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.sessionId !== sessionId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await db
      .update(conversations as any)
      .set({
        context,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, id) as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update conversation context:", error);
    return NextResponse.json({ error: "Failed to update conversation context." }, { status: 500 });
  }
}