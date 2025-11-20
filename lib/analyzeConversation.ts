import "server-only";

import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { Persona, ConversationPerspective, RelationshipType, GenderOption } from "@/types/analysis";
import type {
  AnalysisInput,
  AnalysisResult,
  ClarificationArea,
  ClarificationCheckResult,
  ConversationContext,
  ParticipantDescriptor,
} from "@/types/analysis";
import { normalizeWhatsAppQuotes, addWhatsAppQuoteContext } from "./whatsappUtils";

// Lazy initialization - only create client when actually needed (not at import time)
// This prevents blocking during compilation
let aiInstance: GoogleGenAI | null = null;
type GeminiPart = { text?: string; inlineData?: { data: string; mimeType: string } };

function buildUserContents(parts: GeminiPart[]) {
  return [
    {
      role: "user" as const,
      parts,
    },
  ];
}

function getAI(): GoogleGenAI {
  if (aiInstance) {
    return aiInstance;
  }

  const apiKey = process.env.GOOGLE_GENAI_API_KEY ?? process.env.API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("GOOGLE_GENAI_API_KEY is not set in environment variables.");
  }

  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
}

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    cringeScore: { type: Type.INTEGER },
    interestLevel: { type: Type.INTEGER },
    responseSpeedRating: { type: Type.STRING },
    redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
    greenFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
    diagnosis: { type: Type.STRING },
    detailedAnalysis: { type: Type.STRING },
    suggestedReplies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tone: { type: Type.STRING },
          text: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
      },
    },
  },
  required: [
    "cringeScore",
    "interestLevel",
    "responseSpeedRating",
    "redFlags",
    "greenFlags",
    "diagnosis",
    "detailedAnalysis",
    "suggestedReplies",
  ],
};

const clarificationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    clarificationNeeded: { type: Type.BOOLEAN },
    rationale: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          area: { type: Type.STRING },
          question: { type: Type.STRING },
          helperText: { type: Type.STRING },
          required: { type: Type.BOOLEAN },
          suggestedAnswer: { type: Type.STRING },
        },
        required: ["id", "area", "question"],
      },
    },
  },
  required: ["clarificationNeeded"],
};



const personaInstructions: Record<Persona, string> = {
  [Persona.BRUTAL_BESTIE]: "Be honest, slightly mean, protective, with modern slang.",
  [Persona.THERAPIST]: "Clinical but warm, focused on attachment styles and boundaries.",
  [Persona.TOXIC_EX]: "Chaotic, manipulative, self-centered and sarcastic.",
  [Persona.FBI_PROFILER]: "Analytical, detached, behavioral profiling tone.",
  [Persona.GEN_Z_ROASTER]: "Brainrot slang, ruthless, internet-native humor.",
  [Persona.CHARISMATIC_FLIRT]: "High-energy hype friend, flirty compliments plus confident but respectful playbook.",
};

const perspectiveNarrative: Record<ConversationPerspective, string> = {
  [ConversationPerspective.THEIR_MESSAGES]:
    "You are judging the OTHER person's messages to you. Highlight how their tone, pacing, and subtext land for you who received them.",
  [ConversationPerspective.MY_MESSAGES]:
    "You are critiquing YOUR outgoing messages. Grade how they sound to the recipient and what energy you're giving.",
  [ConversationPerspective.BOTH]:
    "You are weighing BOTH sides. Call out who sends each message and compare their energy to show the push/pull.",
  [ConversationPerspective.UNSURE]:
    "You aren't sure whose messages are whose. Try to infer based on context and clearly label who seems to be speaking in each callout.",
};

const relationshipLabels: Record<RelationshipType, string> = {
  [RelationshipType.DATING]: "Dating / romantic",
  [RelationshipType.SITUATIONSHIP]: "Situationship / undefined romance",
  [RelationshipType.FRIENDS]: "Friends (platonic)",
  [RelationshipType.FAMILY]: "Family",
  [RelationshipType.COWORKERS]: "Coworkers / professional",
  [RelationshipType.EXES]: "Exes / recently ended",
  [RelationshipType.ONLINE_ONLY]: "Online-only connection",
  [RelationshipType.OTHER]: "Other / custom",
  [RelationshipType.NOT_SURE]: "Relationship unclear",
};

const genderLabels: Record<GenderOption, string> = {
  [GenderOption.WOMAN]: "woman",
  [GenderOption.MAN]: "man",
  [GenderOption.NON_BINARY]: "non-binary person",
  [GenderOption.QUEER]: "queer / fluid identity",
  [GenderOption.PREFER_NOT]: "prefers not to say",
  [GenderOption.UNKNOWN]: "unspecified",
};

const clarificationAreaPrompts: Record<ClarificationArea, string> = {
  perspective: "Clarify whether the user wants us to judge their messages, the other person's, or both.",
  relationshipType: "Define the overall relationship dynamic (dating, coworkers, friends, etc.).",
  userRole: "Describe how the user would label their own role in the dynamic.",
  partnerRole: "Describe how the other person is labeled (e.g., manager, situationship).",
  userGender: "Share how the user identifies, if relevant.",
  partnerGender: "Share how the other person identifies, if relevant.",
};

const CLARIFICATION_MAX_PREVIEW = 6000;

function formatParticipant(label: string, descriptor?: ParticipantDescriptor): string | null {
  if (!descriptor || (!descriptor.role && !descriptor.gender)) {
    return null;
  }

  const parts: string[] = [];
  if (descriptor.role) {
    parts.push(descriptor.role);
  }
  if (descriptor.gender && descriptor.gender !== GenderOption.UNKNOWN) {
    parts.push(genderLabels[descriptor.gender]);
  }

  if (parts.length === 0) return null;
  return `${label}: ${parts.join(", ")}`;
}

function buildContextInstruction(context?: ConversationContext): string {
  if (!context) {
    return perspectiveNarrative[ConversationPerspective.THEIR_MESSAGES];
  }

  const lines: string[] = [];
  lines.push(perspectiveNarrative[context.perspective]);

  if (context.relationshipType) {
    lines.push(`Relationship snapshot: ${relationshipLabels[context.relationshipType]}.`);
  }

  const youLine = formatParticipant("User", context.user);
  const partnerLine = formatParticipant("Other person", context.partner);
  if (youLine) lines.push(youLine);
  if (partnerLine) lines.push(partnerLine);

  return lines.join("\n");
}

function describeContextGaps(context?: ConversationContext): string[] {
  const gaps: string[] = [];
  if (!context) {
    gaps.push("No conversation context provided.");
    return gaps;
  }
  if (!context.relationshipType) {
    gaps.push("relationshipType missing");
  }
  if (!context.user?.role) {
    gaps.push("user role unknown");
  }
  if (!context.partner?.role) {
    gaps.push("partner role unknown");
  }
  if (!context.user?.gender || context.user.gender === GenderOption.UNKNOWN) {
    gaps.push("user gender unspecified");
  }
  if (!context.partner?.gender || context.partner.gender === GenderOption.UNKNOWN) {
    gaps.push("partner gender unspecified");
  }
  if (context.perspective === ConversationPerspective.UNSURE) {
    gaps.push("perspective marked as unsure");
  }
  return gaps;
}

function truncateConversationText(content: string, limit = CLARIFICATION_MAX_PREVIEW): string {
  if (content.length <= limit) {
    return content;
  }
  return content.slice(-limit);
}

export async function assessClarificationNeeds(
  input: AnalysisInput,
  conversationContext?: ConversationContext
): Promise<ClarificationCheckResult> {
  const ai = getAI();
  const contextInstruction = buildContextInstruction(conversationContext);
  const gaps = describeContextGaps(conversationContext);
  const allowedAreas = Object.entries(clarificationAreaPrompts)
    .map(([area, detail]) => `- ${area}: ${detail}`)
    .join("\n");

  const parts: GeminiPart[] = [];

  if (input.type === "text") {
    const normalizedContent = normalizeWhatsAppQuotes(input.content);
    parts.push({
      text: [
        "=== Conversation Preview ===",
        truncateConversationText(normalizedContent),
        "=== End Preview ===",
      ].join("\n"),
    });
  } else {
    parts.push({
      text: `User provided a screenshot of the conversation. 

IMPORTANT - For Screenshots:
1. Identify message alignment: LEFT side (usually other person) vs RIGHT side (usually user)
2. Extract ALL messages in order with their position markers [LEFT] or [RIGHT]
3. Identify quoted messages - remember alignment shows who sent the message, not quoted names
4. Structure clearly before determining clarification needs.`,
    });
    parts.push({
      inlineData: {
        data: input.base64,
        mimeType: input.mimeType,
      },
    });
  }

  const systemInstruction = `
You are Textopsy's intake triage specialist.
Decide if we MUST ask the user clarifying questions before full analysis.

Current context (if any):
${contextInstruction || "None provided yet."}

Potential gaps noticed: ${gaps.length ? gaps.join(", ") : "none"}

Allowed follow-up areas:
${allowedAreas}

IMPORTANT - WhatsApp Quote Handling:
In WhatsApp, when someone quotes a message, it appears as "PersonName" wrote: [quoted message].
The quoted person's name appearing in a message does NOT mean they wrote that message.
The person who wrote the message containing the quote is the actual sender.
Quoted messages may be marked with [QUOTED FROM PersonName] ... [END QUOTE] tags.
Only analyze messages as belonging to the person who actually sent them, not quoted names within them.

Rules:
- Only ask about the allowed areas above.
- Max 2 questions.
- If everything essential is present, respond with clarificationNeeded=false.
- Prefer clarity over quantity; skip obvious or already provided details.
- IMPORTANT - Gender clarification: If gender information is unclear for BOTH parties (user and other person), you should ask questions for BOTH userGender AND partnerGender (as separate questions, up to the 2 question max). Don't ask for only one gender if both are unclear - ask for both.

Return strictly valid JSON that matches the clarification schema.
`.trim();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: buildUserContents(parts),
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: clarificationSchema,
      temperature: 0.1,
    },
  });

  const text = response.text;
  if (!text) {
    return {
      clarificationNeeded: false,
      questions: [],
    };
  }

  const parsed = JSON.parse(text) as ClarificationCheckResult;
  return {
    clarificationNeeded: !!parsed.clarificationNeeded,
    rationale: parsed.rationale,
    questions: Array.isArray(parsed.questions) ? parsed.questions : [],
  };
}

export async function generateConversationalResponse(
  userMessage: string,
  persona: Persona,
  conversationContext?: ConversationContext,
  chatHistory?: Array<{ role: "user" | "assistant"; content: string }>,
  previousAnalyses?: Array<{ diagnosis: string; detailedAnalysis: string; persona: string; cringeScore?: number; interestLevel?: number }>,
  conversationEvidence?: string
): Promise<string> {
  const ai = getAI();
  
  // Build context from previous analyses
  let analysesContext = "";
  if (previousAnalyses && previousAnalyses.length > 0) {
    analysesContext = "=== PREVIOUS ANALYSES ===\n\n";
    previousAnalyses.forEach((analysis, idx) => {
      analysesContext += `--- Analysis #${previousAnalyses.length - idx} (${analysis.persona}) ---\n`;
      analysesContext += `Diagnosis: ${analysis.diagnosis}\n`;
      if (analysis.interestLevel !== undefined) {
        analysesContext += `Interest Level: ${analysis.interestLevel}%\n`;
      }
      if (analysis.cringeScore !== undefined) {
        analysesContext += `Cringe Score: ${analysis.cringeScore}%\n`;
      }
      analysesContext += `Analysis: ${analysis.detailedAnalysis}\n\n`;
    });
    analysesContext += "=== END PREVIOUS ANALYSES ===\n\n";
  }

  // Build conversation evidence context (original inputs)
  let evidenceContext = "";
  if (conversationEvidence && conversationEvidence.trim()) {
    evidenceContext = "=== CONVERSATION EVIDENCE ===\n\n";
    evidenceContext += conversationEvidence.trim();
    evidenceContext += "\n\n=== END CONVERSATION EVIDENCE ===\n\n";
  }

  // Build chat history context
  let chatHistoryText = "";
  if (chatHistory && chatHistory.length > 0) {
    chatHistoryText = "=== CHAT HISTORY ===\n\n";
    chatHistory.slice(-10).forEach((msg) => {
      chatHistoryText += `${msg.role === "user" ? "User" : "You"}: ${msg.content}\n`;
    });
    chatHistoryText += "\n=== END CHAT HISTORY ===\n\n";
  }

  const personaInstruction = personaInstructions[persona];
  
  const prompt = `${analysesContext}${evidenceContext}${chatHistoryText}
You are responding as a ${persona} in a conversational style (NOT as an analysis).

The user is asking you a question about their conversation or relationship situation. You have access to:
- Previous analyses that have been done on their conversations
- The actual conversation evidence (messages/text) that was analyzed
- The chat history of your conversation with them

Respond naturally and conversationally in the ${persona} persona style: ${personaInstruction}

Current user message: "${userMessage}"

Respond conversationally. Keep it natural, helpful, and in character. Reference specific details from the evidence or analyses when relevant. Do NOT provide an analysis format - just respond as if you're chatting with them.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildUserContents([{ text: prompt }]),
      config: {
        temperature: 0.9,
        maxOutputTokens: 1000,
      },
    });

    const text = response.text || "Sorry, I couldn't generate a response.";
    return text.trim();
  } catch (error) {
    console.error("Error generating conversational response:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to generate response: ${error.message}`
        : "Failed to generate conversational response"
    );
  }
}

export async function analyzeConversation(
  input: AnalysisInput & { contextText?: string },
  persona: Persona,
  conversationContext?: ConversationContext
): Promise<AnalysisResult> {
  const startTime = Date.now();
  console.error("🤖 [GEMINI] ========== STARTING ANALYSIS ==========");
  console.error("🤖 [GEMINI] Input type:", input.type);
  console.error("🤖 [GEMINI] Persona:", persona);
  console.error("🤖 [GEMINI] Has context:", !!input.contextText);
  console.error("🤖 [GEMINI] Perspective:", conversationContext?.perspective ?? "default (their messages)");

  let ai: GoogleGenAI;
  try {
    ai = getAI();
  } catch (error) {
    const errorMsg = error instanceof Error 
      ? error.message 
      : "Gemini client unavailable. GOOGLE_GENAI_API_KEY is not set in environment variables. Please set it in your .env.local file and restart the dev server.";
    console.error("❌ [GEMINI]", errorMsg);
    throw new Error(errorMsg);
  }

  // Build prompt with context if available (for continuing conversations)
  let promptText: string;
  const parts: GeminiPart[] = [];

  if (input.type === "image") {
    // Images are always evidence/analysis
    if (input.contextText) {
      const normalizedContext = normalizeWhatsAppQuotes(input.contextText);
      parts.push({ text: addWhatsAppQuoteContext(`${normalizedContext}\n\n--- New Screenshot ---\n\n`) });
      promptText = `STEP 1 - Extract and Structure Messages:
First, carefully examine the conversation screenshot and extract ALL messages in order:
- Identify each message's position: LEFT side (usually from the other person) or RIGHT side (usually from you)
- Extract the complete text of each message
- Identify any quoted/forwarded messages (look for "PersonName" wrote: patterns or forward indicators)
- Note timestamps if visible
- Structure them clearly before analysis

Output the structured conversation like this:
[LEFT] Message text here
[RIGHT] Message text here  
[LEFT] "QuotedName" wrote: [quoted message text]
        Reply to the quote here
[RIGHT] Another message

STEP 2 - Perform Analysis:
Now perform a Textopsy on this structured conversation, considering the past conversation evidence and inputs provided above. 
Use the message alignment (LEFT/RIGHT) and quote identification to correctly attribute messages to their actual senders.
Write in second person (use "your", "you") when addressing the person reading the analysis.
Give me the raw truth.`;
    } else {
      parts.push({ text: addWhatsAppQuoteContext("") });
      promptText = `STEP 1 - Extract and Structure Messages:
First, carefully examine the conversation screenshot and extract ALL messages in order:
- Identify each message's position: LEFT side (usually from the other person) or RIGHT side (usually from you)
- Extract the complete text of each message
- Identify any quoted/forwarded messages (look for "PersonName" wrote: patterns or forward indicators)
- Note timestamps if visible
- Structure them clearly before analysis

Output the structured conversation like this:
[LEFT] Message text here
[RIGHT] Message text here  
[LEFT] "QuotedName" wrote: [quoted message text]
        Reply to the quote here
[RIGHT] Another message

STEP 2 - Perform Analysis:
Now perform a Textopsy on this structured conversation.
Use the message alignment (LEFT/RIGHT) and quote identification to correctly attribute messages to their actual senders.
Write in second person (use "your", "you") when addressing the person reading the analysis.
Give me the raw truth.`;
    }

    // Add image
    parts.push({
      inlineData: {
        data: input.base64,
        mimeType: input.mimeType,
      },
    });

    // Add prompt text after image
    parts.push({ text: promptText });
  } else {
    // Normalize WhatsApp quotes before processing
    const normalizedContent = normalizeWhatsAppQuotes(input.content);
    
    // Text input - always treat as evidence/analysis request
    // Check if it's a question asking for analysis (has question mark or question words)
    const cleanText = normalizedContent
      .replace(/=== PAST CONVERSATION EVIDENCE ===[\s\S]*?=== END PAST CONVERSATION EVIDENCE ===/g, '')
      .replace(/=== PAST CONVERSATION INPUTS ===[\s\S]*?=== END PAST CONVERSATION INPUTS ===/g, '')
      .replace(/--- Latest Addition ---/g, '')
      .trim();
    
    const isAnalysisQuestion = /[?]|^(what|how|why|when|where|who|which|explain|analyze|interpret|what's|what do)/i.test(cleanText);
    
    if (normalizedContent.includes("=== PAST CONVERSATION EVIDENCE ===") || input.contextText) {
      if (isAnalysisQuestion) {
        // User is asking a question about the evidence - analyze and answer the question
        const normalizedContext = input.contextText ? normalizeWhatsAppQuotes(input.contextText) : "";
        const contextPart = input.contextText 
          ? `${normalizedContext}\n\n--- User Question ---\n\n${cleanText}`
          : normalizedContent;
        parts.push({ text: addWhatsAppQuoteContext(contextPart) });
        promptText = `You are asking: "${cleanText}"\n\nPerform a Textopsy analysis considering the past conversation evidence and inputs provided above. Answer your question based on the evidence. Provide a full analysis with all the standard Textopsy components (diagnosis, scores, flags, etc.) but tailor the diagnosis and detailed analysis to directly address your question. Write in second person (use "your", "you") when addressing the person reading the analysis. Give me the raw truth.`;
      } else {
        if (input.contextText) {
          const normalizedContext = normalizeWhatsAppQuotes(input.contextText);
          parts.push({ text: addWhatsAppQuoteContext(`${normalizedContext}\n\n--- New Evidence ---\n\n${normalizedContent}`) });
        } else {
          parts.push({ text: addWhatsAppQuoteContext(normalizedContent) });
        }
        promptText = "Perform a Textopsy on this text transcript, considering the past conversation evidence and inputs provided above. Write in second person (use 'your', 'you') when addressing the person reading the analysis. Give me the raw truth.";
      }
    } else {
      if (isAnalysisQuestion) {
        // User is asking a question without past context - this shouldn't happen but handle it
        parts.push({ text: addWhatsAppQuoteContext(normalizedContent) });
        promptText = `You are asking: "${cleanText}"\n\nHowever, there's no conversation evidence to analyze. Perform a Textopsy analysis if there's any conversation data in the input, otherwise indicate that evidence is needed. Write in second person (use "your", "you") when addressing the person reading the analysis.`;
      } else {
        parts.push({ text: addWhatsAppQuoteContext(normalizedContent) });
        promptText = "Perform a Textopsy on this text transcript. Write in second person (use 'your', 'you') when addressing the person reading the analysis. Give me the raw truth.";
      }
    }
  }

  const contextInstruction = buildContextInstruction(conversationContext);

  const systemInstruction = `
You are Textopsy, an expert text-message analyst.
Adopt the persona: ${persona}.
${personaInstructions[persona]}
${contextInstruction ? `\n${contextInstruction}\n` : ""}
Focus on ratio of messages, emoji presence, time gaps, punctuation aggression, and filler words.

CRITICAL - Screenshot Message Extraction & WhatsApp Quote Handling:
For screenshots, you MUST first extract and structure all messages before analysis:
1. Identify message alignment: LEFT side messages vs RIGHT side messages
   - LEFT = usually from the other person
   - RIGHT = usually from you
   - This determines who actually sent each message

2. Extract ALL messages in chronological order, maintaining their position markers [LEFT] or [RIGHT]

3. Identify quoted/forwarded messages:
   - Look for patterns like "PersonName" wrote: [message] 
   - The quoted person's name appearing in a message does NOT mean they wrote that message
   - The message alignment (LEFT/RIGHT) shows who actually sent the message containing the quote
   - Example: A [RIGHT] message containing "John" wrote: Hello means YOU quoted John's message, not that John wrote it

4. Structure messages clearly with [LEFT]/[RIGHT] markers before performing analysis

IMPORTANT: Always use message alignment (LEFT/RIGHT) to determine the actual sender, NOT quoted names within messages.
Quoted messages are just content being referenced - the alignment shows who sent the message.

IMPORTANT - Personalization:
- Write all analysis in second person (use "your", "you", etc.) directly addressing the person reading the analysis
- Instead of "User's responses were good" say "Your responses were good"
- Instead of "the user" say "you"
- Make it personal and direct, as if talking directly to them

IMPORTANT: 
- diagnosis must be a SHORT 1-2 line punchline (max 120 characters). Be witty, direct, and memorable.
- detailedAnalysis should contain the full breakdown and explanation (can be longer). Use second person throughout.
- cringeScore must be an integer percentage from 0-100 (0 = not cringe, 100 = maximum cringe)
- interestLevel must be an integer percentage from 0-100 (0 = no interest, 100 = maximum interest)

Return strictly valid JSON.
`.trim();

  console.error("🤖 [GEMINI] Calling generateContent...", {
    model: "gemini-2.5-flash",
    partsCount: parts.length,
    elapsed: Date.now() - startTime + "ms",
  });

  try {
    // Use the same structure as frontend
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildUserContents(parts),
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.7,
      },
    });

    console.error("✅ [GEMINI] Response received:", {
      elapsed: Date.now() - startTime + "ms",
      hasText: !!response.text,
    });

    // Get text from response - same as frontend
    const text = response.text;

    if (!text) {
      console.error("❌ [GEMINI] Unexpected response structure:", JSON.stringify(response, null, 2));
      throw new Error("Gemini response empty or structure unknown.");
    }

    console.error("✅ [GEMINI] Parsing JSON response...", {
      textLength: text.length,
      elapsed: Date.now() - startTime + "ms",
    });

    const parsed = JSON.parse(text) as AnalysisResult;
    console.error("✅ [GEMINI] ========== ANALYSIS COMPLETE ==========");
    console.error("✅ [GEMINI] Diagnosis:", parsed.diagnosis?.substring(0, 50));
    console.error("✅ [GEMINI] Total elapsed:", Date.now() - startTime + "ms");
    return parsed;
  } catch (error) {
    console.error("❌ [GEMINI] Error in generateContent:", error);
    throw error;
  }
}

