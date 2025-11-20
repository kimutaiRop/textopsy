import { NextResponse } from "next/server";
import { Persona, type ConversationContext } from "@/types/analysis";
import { verifyToken, getAuthTokenFromRequest } from "@/lib/auth";
import { db, conversations, chatMessages, analyses } from "@/lib/db";
import { generateId, getConversationInputs, getSessionIdFromRequest } from "@/lib/conversation";
import { generateConversationalResponse } from "@/lib/analyzeConversation";
import { eq, desc } from "drizzle-orm";
import { FreemiumLimitError, getUserPlanInfo, incrementSubmissionUsage } from "@/lib/billing";

type ChatRequest = {
  message: string;
  persona: Persona;
  conversationContext?: ConversationContext | null;
};

const personaValues = new Set(Object.values(Persona));

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;
  const sessionId = getSessionIdFromRequest(request);

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID required." },
      { status: 401 }
    );
  }

  // Check authentication
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required. Please log in to send messages." },
      { status: 401 }
    );
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired token. Please log in again." },
      { status: 401 }
    );
  }

  const planInfo = await getUserPlanInfo(user.id);
  if (!planInfo) {
    return NextResponse.json(
      { error: "User account not found." },
      { status: 401 }
    );
  }

  // Check API key
  const apiKey = process.env.GOOGLE_GENAI_API_KEY ?? process.env.API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return NextResponse.json(
      {
        error:
          "Server configuration error: Google Gemini API key not found.",
      },
      { status: 500 }
    );
  }

  try {
    const payload = (await request.json()) as ChatRequest;

    // Message can be empty if there's an image (handled on client side)
    if (!payload.message || !payload.message.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (!payload.persona || !personaValues.has(payload.persona)) {
      return NextResponse.json(
        { error: "Invalid persona provided." },
        { status: 400 }
      );
    }

    // Verify conversation exists
    const conversationRows = await db
      .select()
      .from(conversations as any)
      .where(eq(conversations.id, conversationId) as any)
      .limit(1);

    const conversation = conversationRows[0];
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }

    if (conversation.sessionId !== sessionId) {
      return NextResponse.json(
        { error: "Access denied." },
        { status: 403 }
      );
    }

    if (conversation.userId && conversation.userId !== planInfo.id) {
      return NextResponse.json(
        { error: "This conversation belongs to another account." },
        { status: 403 }
      );
    }

    if (!conversation.userId) {
      await db
        .update(conversations as any)
        .set({ userId: planInfo.id })
        .where(eq(conversations.id, conversationId) as any);
    }

    // Load chat history (last 20 messages)
    let historyRows: any[] = [];
    try {
      historyRows = await db
        .select()
        .from(chatMessages as any)
        .where(eq(chatMessages.conversationId, conversationId) as any)
        .orderBy(desc(chatMessages.createdAt) as any)
        .limit(20);
    } catch (chatError) {
      console.warn("Chat messages table might not exist yet:", chatError);
      historyRows = [];
    }

    const chatHistory = historyRows
      .reverse()
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

    // Load previous analyses for context
    const analysisRows = await db
      .select({
        diagnosis: analyses.diagnosis,
        detailedAnalysis: analyses.detailedAnalysis,
        persona: analyses.persona,
        cringeScore: analyses.cringeScore,
        interestLevel: analyses.interestLevel,
      })
      .from(analyses as any)
      .where(eq(analyses.conversationId, conversationId) as any)
      .orderBy(desc(analyses.createdAt) as any);

    // Load conversation inputs (evidence)
    let conversationEvidence = "";
    try {
      conversationEvidence = await getConversationInputs(conversationId);
    } catch (error) {
      console.warn("Failed to load conversation inputs:", error);
      conversationEvidence = "";
    }

    try {
      await incrementSubmissionUsage(planInfo.id, planInfo.isPro);
    } catch (limitError) {
      if (limitError instanceof FreemiumLimitError) {
        return NextResponse.json(
          { error: limitError.message, code: limitError.code, details: limitError.details },
          { status: limitError.status }
        );
      }
      throw limitError;
    }

    // Save user message
    const userMessageId = generateId();
    await db.insert(chatMessages as any).values({
      id: userMessageId,
      conversationId,
      role: "user",
      content: payload.message.trim(),
      persona: null,
      createdAt: new Date(),
    });

    // Generate AI response
    const aiResponse = await generateConversationalResponse(
      payload.message.trim(),
      payload.persona,
      payload.conversationContext || conversation.context || undefined,
      chatHistory,
      analysisRows,
      conversationEvidence
    );

    // Save AI response
    const assistantMessageId = generateId();
    await db.insert(chatMessages as any).values({
      id: assistantMessageId,
      conversationId,
      role: "assistant",
      content: aiResponse,
      persona: payload.persona,
      createdAt: new Date(),
    });

    // Update conversation updatedAt
    await db
      .update(conversations as any)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId) as any);

    return NextResponse.json({
      userMessage: {
        id: userMessageId,
        role: "user",
        content: payload.message.trim(),
        createdAt: new Date(),
      },
      assistantMessage: {
        id: assistantMessageId,
        role: "assistant",
        content: aiResponse,
        persona: payload.persona,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    if (error instanceof FreemiumLimitError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: error.status }
      );
    }
    console.error("Error in chat endpoint:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to send message: ${errorMessage}` },
      { status: 500 }
    );
  }
}

