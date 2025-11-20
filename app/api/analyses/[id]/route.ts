import { NextResponse } from "next/server";
import { db, analyses, conversationInputs } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyToken, getAuthTokenFromRequest } from "@/lib/auth";

const databaseUrl = process.env.DATABASE_URL;

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!databaseUrl) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    // Verify authentication
    const authToken = getAuthTokenFromRequest(request);
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(authToken);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;

    // Get the analysis to find its input data
    const analysisRows = await db
      .select()
      .from(analyses as any)
      .where(eq(analyses.id, id) as any)
      .limit(1);

    if (analysisRows.length === 0) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const analysis = analysisRows[0];

    // Delete the analysis
    await db.delete(analyses as any).where(eq(analyses.id, id) as any);

    // Delete associated conversation inputs that match this analysis's input
    // We match by inputType and content (text or image base64)
    // First, find matching inputs
    const matchingInputs = await db
      .select()
      .from(conversationInputs as any)
      .where(eq(conversationInputs.conversationId, analysis.conversationId!) as any);
    
    // Filter and delete inputs that match this analysis
    for (const input of matchingInputs) {
      let shouldDelete = false;
      
      if (analysis.inputType === "text" && input.inputType === "text") {
        shouldDelete = input.inputText === analysis.inputText;
      } else if (analysis.inputType === "image" && input.inputType === "image") {
        shouldDelete = input.inputImageBase64 === analysis.inputImageBase64;
      }
      
      if (shouldDelete) {
        await db.delete(conversationInputs as any).where(eq(conversationInputs.id, input.id) as any);
      }
    }

    return NextResponse.json({ message: "Analysis deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete analysis:", error);
    return NextResponse.json({ error: "Failed to delete analysis." }, { status: 500 });
  }
}

