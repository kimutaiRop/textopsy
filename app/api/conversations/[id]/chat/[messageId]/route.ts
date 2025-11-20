import { NextResponse } from "next/server";
import { verifyToken, getAuthTokenFromRequest } from "@/lib/auth";
import { db, chatMessages, conversations } from "@/lib/db";
import { getSessionIdFromRequest } from "@/lib/conversation";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { id: conversationId, messageId } = await params;
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
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired token." },
      { status: 401 }
    );
  }

  try {
    const conversationRows = await db
      .select()
      .from(conversations as any)
      .where(eq(conversations.id, conversationId) as any)
      .limit(1);

    const conversation = conversationRows[0];
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.sessionId !== sessionId) {
      return NextResponse.json(
        { error: "Access denied." },
        { status: 403 }
      );
    }

    // Verify the message exists and belongs to this conversation
    const messageRows = await db
      .select()
      .from(chatMessages as any)
      .where(eq(chatMessages.id, messageId) as any)
      .limit(1);

    if (messageRows.length === 0) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    const message = messageRows[0];
    if (message.conversationId !== conversationId) {
      return NextResponse.json(
        { error: "Message does not belong to this conversation" },
        { status: 403 }
      );
    }

    // Delete the message
    await db.delete(chatMessages as any).where(eq(chatMessages.id, messageId) as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete chat message:", error);
    return NextResponse.json(
      { error: "Failed to delete message." },
      { status: 500 }
    );
  }
}

