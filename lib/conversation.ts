import "server-only";

import type { AnalysisInput } from "@/types/analysis";
import { db, conversations, conversationInputs } from "@/lib/db";
import { eq, asc } from "drizzle-orm";

/**
 * Generate a unique ID using crypto.randomUUID or fallback
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create a session ID for a user (stored client-side)
 */
export async function getOrCreateSession(sessionId: string | null): Promise<string> {
  // If sessionId provided, validate it exists (or create new one)
  // For now, we'll trust the client's sessionId and just use it
  // In production, you might want to validate/store sessions server-side
  if (sessionId) {
    return sessionId;
  }

  // Generate UUID on server
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for Node < 19
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Extract the client session ID from a request via header or query param.
 */
export function getSessionIdFromRequest(request: Request): string | null {
  const headerSession = request.headers.get("x-session-id")?.trim();
  if (headerSession) {
    return headerSession;
  }

  try {
    const { searchParams } = new URL(request.url);
    const paramSession = searchParams.get("sessionId")?.trim();
    if (paramSession) {
      return paramSession;
    }
  } catch {
    // Ignore URL parsing issues and fall through
  }

  return null;
}

/**
 * Get a conversation with all its inputs accumulated
 */
export async function getConversationInputs(conversationId: string): Promise<string> {
  const inputs = await db
    .select()
    .from(conversationInputs as any)
    .where(eq(conversationInputs.conversationId, conversationId) as any)
    .orderBy(asc(conversationInputs.order) as any);

  // Combine all inputs into a single text representation
  const parts: string[] = [];

  for (const input of inputs) {
    if (input.inputType === "text" && input.inputText) {
      parts.push(input.inputText);
    } else if (input.inputType === "image") {
      parts.push("[Image added to conversation]");
    }
  }

  return parts.join("\n\n--- Additional Context ---\n\n");
}

/**
 * Add input to a conversation
 */
export async function addInputToConversation(
  conversationId: string,
  input: AnalysisInput,
  order: number
): Promise<void> {
  await db.insert(conversationInputs as any).values({
    id: generateId(),
    conversationId,
    inputType: input.type,
    inputText: input.type === "text" ? input.content : null,
    inputImageBase64: input.type === "image" ? input.base64 : null,
    inputImageMimeType: input.type === "image" ? input.mimeType : null,
    order,
  });
}