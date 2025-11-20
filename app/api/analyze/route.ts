import { NextResponse } from "next/server";
import { Persona, type AnalysisInput, type AnalysisResult, type ConversationContext } from "@/types/analysis";
import { verifyToken, getAuthTokenFromRequest } from "@/lib/auth";
import { db, conversations, analyses, conversationInputs } from "@/lib/db";
import { addInputToConversation, getConversationInputs, getOrCreateSession, generateId } from "@/lib/conversation";
import { eq, count, desc } from "drizzle-orm";
import { ensureConversationAllowance, FreemiumLimitError, getUserPlanInfo, incrementSubmissionUsage } from "@/lib/billing";

type AnalyzeRequest = {
  persona: Persona;
  input: AnalysisInput;
  conversationId?: string | null; // Optional: continue existing conversation
  sessionId?: string | null; // Browser session ID
  updateAnalysisId?: string | null; // Optional: update existing analysis instead of creating new
  context?: ConversationContext | null;
};

const personaValues = new Set(Object.values(Persona));

export async function POST(request: Request) {
  const startTime = Date.now();
  // Use console.error to ensure it shows in terminal (Next.js sometimes suppresses console.log)
  console.error("🔵 [ANALYZE] ========== REQUEST RECEIVED ==========");
  console.error("🔵 [ANALYZE] Time:", new Date().toISOString());

  // Check authentication FIRST
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required. Please log in to submit an analysis." },
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

  console.error("✅ [ANALYZE] User authenticated:", user.email);

  // Check API key FIRST, before parsing request body
  const apiKey = process.env.GOOGLE_GENAI_API_KEY ?? process.env.API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    const errorMsg = "❌ GOOGLE_GENAI_API_KEY is missing or empty. Please set it in your .env.local file.";
    console.error(errorMsg);
    return NextResponse.json(
      { 
        error: "Server configuration error: Google Gemini API key not found. Please set GOOGLE_GENAI_API_KEY in your .env.local file and restart the dev server." 
      },
      { status: 500 }
    );
  }
  console.error("✅ [ANALYZE] API key found:", apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 4));

  // Dynamic import to avoid blocking compilation
  const { analyzeConversation } = await import("@/lib/analyzeConversation");
  
  const databaseUrl = process.env.DATABASE_URL;

  try {
    const payload = (await request.json()) as AnalyzeRequest;
    console.error("✅ [ANALYZE] Payload parsed:", {
      persona: payload.persona,
      inputType: payload.input.type,
      hasContent: payload.input.type === "text" ? !!payload.input.content : !!payload.input.base64,
      conversationId: payload.conversationId || "none",
      perspective: payload.context?.perspective || "default",
    });

    if (!payload?.input) {
      return NextResponse.json({ error: "Missing input payload." }, { status: 400 });
    }

    if (!payload.persona || !personaValues.has(payload.persona)) {
      return NextResponse.json({ error: "Invalid persona provided." }, { status: 400 });
    }

    if (payload.input.type === "text" && !payload.input.content.trim()) {
      return NextResponse.json({ error: "Conversation text is empty." }, { status: 400 });
    }

    if (payload.input.type === "image" && (!payload.input.base64 || !payload.input.mimeType)) {
      return NextResponse.json({ error: "Image input is incomplete." }, { status: 400 });
    }

    const planInfo = await getUserPlanInfo(user.id);
    if (!planInfo) {
      return NextResponse.json({ error: "User account not found." }, { status: 401 });
    }

    try {
      if (!payload.conversationId) {
        await ensureConversationAllowance(planInfo.id, planInfo.isPro);
      }
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

    // Handle conversation accumulation
    let finalInput: AnalysisInput = payload.input;
    let conversationId: string | null = payload.conversationId || null;
    let sessionId: string | null = payload.sessionId || null;

    // Check if database is available
    const hasDb = !!databaseUrl;

    if (hasDb && conversationId) {
      const [conversationMeta] = await db
        .select({
          id: conversations.id,
          sessionId: conversations.sessionId,
          userId: conversations.userId,
        })
        .from(conversations as any)
        .where(eq(conversations.id, conversationId) as any)
        .limit(1);

      if (!conversationMeta) {
        return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
      }

      if (sessionId && conversationMeta.sessionId !== sessionId) {
        return NextResponse.json(
          { error: "Access denied for this conversation." },
          { status: 403 }
        );
      }

      if (!sessionId) {
        sessionId = conversationMeta.sessionId;
      }

      if (conversationMeta.userId && conversationMeta.userId !== planInfo.id) {
        return NextResponse.json(
          { error: "This conversation belongs to another account." },
          { status: 403 }
        );
      }

      if (!conversationMeta.userId) {
        await db
          .update(conversations as any)
          .set({
            userId: planInfo.id,
          })
          .where(eq(conversations.id, conversationMeta.id) as any);
      }
    }

    // If continuing a conversation, accumulate all previous inputs
    // BUT: if updating an existing analysis, don't add new input - just use existing context
    if (hasDb && conversationId && !payload.updateAnalysisId) {
      // Capture conversationId in a const so TypeScript knows it's not null
      const currentConversationId: string = conversationId;
      console.error("🔄 [ANALYZE] Continuing conversation:", currentConversationId);
      try {
        // Run independent queries in parallel
        const [conversationRows, accumulatedText, countRows, previousAnalyses] = await Promise.all([
          db
            .select()
            .from(conversations as any)
            .where(eq(conversations.id, currentConversationId) as any)
            .limit(1),
          getConversationInputs(currentConversationId),
          db
                .select({ count: count() as any })
            .from(conversationInputs as any)
            .where(eq(conversationInputs.conversationId, currentConversationId) as any),
          db
            .select()
            .from(analyses as any)
            .where(eq(analyses.conversationId, currentConversationId) as any)
            .orderBy(desc(analyses.createdAt) as any),
        ]);
        
        const [conversation] = conversationRows;
        console.error("✅ [ANALYZE] Conversation loaded:", !!conversation);

        if (conversation) {
          const inputCount = countRows[0]?.count || 0;
          console.error("✅ [ANALYZE] Accumulated text length:", accumulatedText.length);
          console.error("✅ [ANALYZE] Input count:", inputCount);
          console.error("✅ [ANALYZE] Previous analyses count:", previousAnalyses.length);

          // Build past conversation evidence from previous analyses
          let pastConversationEvidence = "";
          if (previousAnalyses.length > 0) {
            const evidenceParts: string[] = [];
            evidenceParts.push("=== PAST CONVERSATION EVIDENCE ===");
            evidenceParts.push("");
            
            previousAnalyses.forEach((analysis: any, idx: number) => {
              evidenceParts.push(`--- Previous Analysis #${previousAnalyses.length - idx} (${analysis.persona}) ---`);
              evidenceParts.push(`Diagnosis: ${analysis.diagnosis}`);
              evidenceParts.push(`Interest Level: ${analysis.interestLevel}%`);
              evidenceParts.push(`Cringe Score: ${analysis.cringeScore}%`);
              if (analysis.detailedAnalysis) {
                evidenceParts.push(`Analysis: ${analysis.detailedAnalysis}`);
              }
              evidenceParts.push("");
            });
            
            evidenceParts.push("=== END PAST CONVERSATION EVIDENCE ===");
            evidenceParts.push("");
            pastConversationEvidence = evidenceParts.join("\n");
          }

          // Combine past conversation evidence with accumulated inputs
          const fullContext = pastConversationEvidence 
            ? `${pastConversationEvidence}\n\n=== PAST CONVERSATION INPUTS ===\n\n${accumulatedText}\n\n=== END PAST CONVERSATION INPUTS ===\n\n`
            : accumulatedText;

          // If current input is text, combine it with accumulated text
          if (payload.input.type === "text") {
            finalInput = {
              type: "text",
              content: `${fullContext}\n\n--- Latest Addition ---\n\n${payload.input.content}`,
            };
          } else {
            // For images, include accumulated text as context
            finalInput = payload.input;
            // Store context separately for use in analyzeConversation
            (finalInput as any).contextText = fullContext;
          }

          // Add new input to conversation (only if not updating existing analysis)
          console.error("💾 [ANALYZE] Adding input to conversation...");
          await addInputToConversation(currentConversationId, payload.input, Number(inputCount));
          console.error("✅ [ANALYZE] Input added to conversation");
        }
      } catch (convError) {
        console.error("❌ [ANALYZE] Failed to load conversation:", convError);
        // Continue without conversation context if it fails - don't block the API call
        console.error("⚠️ [ANALYZE] Continuing without conversation context");
      }
    } else if (hasDb && conversationId && payload.updateAnalysisId) {
      // Updating existing analysis - load context but don't add new input
      const currentConversationId: string = conversationId;
      console.error("🔄 [ANALYZE] Updating analysis in conversation:", currentConversationId);
      try {
        const [accumulatedText, previousAnalyses] = await Promise.all([
          getConversationInputs(currentConversationId),
          db
            .select()
            .from(analyses as any)
            .where(eq(analyses.conversationId, currentConversationId) as any)
            .orderBy(desc(analyses.createdAt) as any),
        ]);

        // Build past conversation evidence (excluding the one being updated)
        let pastConversationEvidence = "";
        const otherAnalyses = previousAnalyses.filter((a: any) => a.id !== payload.updateAnalysisId);
        if (otherAnalyses.length > 0) {
          const evidenceParts: string[] = [];
          evidenceParts.push("=== PAST CONVERSATION EVIDENCE ===");
          evidenceParts.push("");
          
          otherAnalyses.forEach((analysis: any, idx: number) => {
            evidenceParts.push(`--- Previous Analysis #${otherAnalyses.length - idx} (${analysis.persona}) ---`);
            evidenceParts.push(`Diagnosis: ${analysis.diagnosis}`);
            evidenceParts.push(`Interest Level: ${analysis.interestLevel}%`);
            evidenceParts.push(`Cringe Score: ${analysis.cringeScore}%`);
            if (analysis.detailedAnalysis) {
              evidenceParts.push(`Analysis: ${analysis.detailedAnalysis}`);
            }
            evidenceParts.push("");
          });
          
          evidenceParts.push("=== END PAST CONVERSATION EVIDENCE ===");
          evidenceParts.push("");
          pastConversationEvidence = evidenceParts.join("\n");
        }

        // Get the original input for the analysis being updated
        const analysisRows = await db
          .select()
          .from(analyses as any)
          .where(eq(analyses.id, payload.updateAnalysisId) as any)
          .limit(1);

        const analysisBeingUpdated = analysisRows[0] as any;
        if (analysisBeingUpdated) {
          // Use the original input from the analysis being updated
          const originalInput: AnalysisInput = analysisBeingUpdated.inputType === "text"
            ? { type: "text", content: analysisBeingUpdated.inputText || "" }
            : { 
                type: "image", 
                base64: analysisBeingUpdated.inputImageBase64 || "", 
                mimeType: analysisBeingUpdated.inputImageMimeType || "image/png" 
              };

          // Combine context with original input
          const fullContext = pastConversationEvidence 
            ? `${pastConversationEvidence}\n\n=== PAST CONVERSATION INPUTS ===\n\n${accumulatedText}\n\n=== END PAST CONVERSATION INPUTS ===\n\n`
            : accumulatedText;

          if (originalInput.type === "text") {
            finalInput = {
              type: "text",
              content: `${fullContext}\n\n--- Original Input ---\n\n${originalInput.content}`,
            };
          } else {
            finalInput = originalInput;
            (finalInput as any).contextText = fullContext;
          }
        }
      } catch (convError) {
        console.error("❌ [ANALYZE] Failed to load conversation for update:", convError);
        // Continue with provided input if context loading fails
      }
    } else {
      console.error("🆕 [ANALYZE] Creating new conversation");
    }

    console.error("🤖 [ANALYZE] Calling Gemini API...", {
      inputType: finalInput.type,
      persona: payload.persona,
      elapsed: Date.now() - startTime + "ms",
    });
    
    const result = await analyzeConversation(finalInput, payload.persona, payload.context || undefined);
    
    console.error("✅ [ANALYZE] Gemini API responded:", {
      hasResult: !!result,
      diagnosis: result.diagnosis?.substring(0, 50),
      elapsed: Date.now() - startTime + "ms",
    });

    // Save to database if DATABASE_URL is set - do this AFTER returning response to avoid blocking
    const saveToDb = async () => {
      if (!databaseUrl) {
        console.error("⚠️ [ANALYZE] No DATABASE_URL, skipping database save");
        return;
      }
      
      try {
        console.error("💾 [ANALYZE] Saving to database...");
        sessionId = await getOrCreateSession(sessionId);
        console.error("✅ [ANALYZE] Session ID:", sessionId);

        // Create conversation if it doesn't exist
        if (!conversationId) {
          console.error("🆕 [ANALYZE] Creating new conversation...");
          const newId = generateId();
          await db.insert(conversations as any).values({
            id: newId,
            sessionId,
            title: result.diagnosis.substring(0, 100), // Use diagnosis as title
            context: payload.context || null,
            userId: planInfo.id,
          });
          conversationId = newId;
          console.error("✅ [ANALYZE] Conversation created:", conversationId);

          // Add first input
          await addInputToConversation(conversationId, payload.input, 0);
          console.error("✅ [ANALYZE] First input added");
        } else if (!payload.updateAnalysisId) {
          // Add input to existing conversation (only if not updating existing analysis)
          const countRows = await db
            .select({ count: count() as any })
            .from(conversationInputs as any)
            .where(eq(conversationInputs.conversationId, conversationId) as any);
          const inputCount = countRows[0]?.count || 0;
          await addInputToConversation(conversationId, payload.input, Number(inputCount));
          console.error("✅ [ANALYZE] Input added to existing conversation");
        } else {
          console.error("🔄 [ANALYZE] Skipping input addition - updating existing analysis");
        }

        // Update conversation updatedAt
        if (conversationId) {
          const updateData: Record<string, any> = { updatedAt: new Date() };
          if (payload.context) {
            updateData.context = payload.context;
          }
          await db.update(conversations as any).set(updateData).where(eq(conversations.id, conversationId) as any);
        }

        // Save or update analysis linked to conversation
        if (payload.updateAnalysisId) {
          console.error("🔄 [ANALYZE] Updating existing analysis:", payload.updateAnalysisId);
          await db.update(analyses as any)
            .set({
              persona: payload.persona,
              cringeScore: result.cringeScore,
              interestLevel: result.interestLevel,
              responseSpeedRating: result.responseSpeedRating,
              redFlags: result.redFlags,
              greenFlags: result.greenFlags,
              diagnosis: result.diagnosis,
              detailedAnalysis: result.detailedAnalysis,
              suggestedReplies: result.suggestedReplies,
              updatedAt: new Date(),
            })
            .where(eq(analyses.id, payload.updateAnalysisId) as any);
          console.error("✅ [ANALYZE] Analysis updated in database");
        } else {
          console.error("💾 [ANALYZE] Saving new analysis to database...");
          await db.insert(analyses as any).values({
          id: generateId(),
          conversationId,
          inputType: payload.input.type,
          inputText: payload.input.type === "text" ? payload.input.content : null,
          inputImageBase64: payload.input.type === "image" ? payload.input.base64 : null,
          inputImageMimeType: payload.input.type === "image" ? payload.input.mimeType : null,
          persona: payload.persona,
          cringeScore: result.cringeScore,
          interestLevel: result.interestLevel,
          responseSpeedRating: result.responseSpeedRating,
          redFlags: result.redFlags,
          greenFlags: result.greenFlags,
          diagnosis: result.diagnosis,
          detailedAnalysis: result.detailedAnalysis,
          suggestedReplies: result.suggestedReplies,
        });
        console.error("✅ [ANALYZE] Analysis saved to database");
        }
      } catch (dbError) {
        // Log but don't fail the request if DB save fails
        console.error("❌ [ANALYZE] Failed to save analysis to database:", dbError);
      }
    };
    // Don't await - let it run in background after response is sent
    saveToDb().catch(err => console.error("❌ [ANALYZE] Background DB save error:", err));

    const totalElapsed = Date.now() - startTime;
    console.error("✅ [ANALYZE] ========== REQUEST COMPLETE ==========", totalElapsed + "ms");

    return NextResponse.json({
      ...result,
      conversationId: conversationId || undefined,
      sessionId: sessionId || undefined,
    });
  } catch (error) {
    if (error instanceof FreemiumLimitError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: error.status }
      );
    }
    const totalElapsed = Date.now() - startTime;
    console.error("❌ [ANALYZE] ========== REQUEST FAILED ==========");
    console.error("❌ [ANALYZE] Error after", totalElapsed + "ms:", error);
    console.error("❌ [ANALYZE] Error stack:", error instanceof Error ? error.stack : "No stack");
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to analyze conversation: ${errorMessage}` },
      { status: 500 }
    );
  }
}
