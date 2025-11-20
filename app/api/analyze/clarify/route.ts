import { NextResponse } from "next/server";
import type { AnalysisInput, ConversationContext } from "@/types/analysis";
import { Persona } from "@/types/analysis";
import { verifyToken, getAuthTokenFromRequest } from "@/lib/auth";

type ClarifyRequest = {
  persona: Persona;
  input: AnalysisInput;
  context?: ConversationContext | null;
};

export async function POST(request: Request) {
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_GENAI_API_KEY ?? process.env.API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return NextResponse.json(
      { error: "Server configuration error: GOOGLE_GENAI_API_KEY is missing." },
      { status: 500 }
    );
  }

  const payload = (await request.json()) as ClarifyRequest;
  if (!payload?.input) {
    return NextResponse.json({ error: "Missing input payload." }, { status: 400 });
  }

  if (!payload.persona || !Object.values(Persona).includes(payload.persona)) {
    return NextResponse.json({ error: "Invalid persona provided." }, { status: 400 });
  }

  if (payload.input.type === "text" && !payload.input.content.trim()) {
    return NextResponse.json({ error: "Conversation text is empty." }, { status: 400 });
  }

  if (payload.input.type === "image" && (!payload.input.base64 || !payload.input.mimeType)) {
    return NextResponse.json({ error: "Image input is incomplete." }, { status: 400 });
  }

  try {
    const { assessClarificationNeeds } = await import("@/lib/analyzeConversation");
    const result = await assessClarificationNeeds(payload.input, payload.context || undefined);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to evaluate clarifications: ${message}` },
      { status: 500 }
    );
  }
}

