import { NextRequest, NextResponse } from "next/server";
import { documentQAStore } from "@/lib/document-qa-store";

export async function POST(request: NextRequest) {
  try {
    const { content, filename } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Document content is required" },
        { status: 400 }
      );
    }

    const result = await documentQAStore.addDocument(
      content,
      filename || `doc_${Date.now()}.txt`
    );

    return NextResponse.json({
      success: true,
      message: "Document added successfully for question answering",
      documentId: result.documentId,
      stats: documentQAStore.getStats(),
    });
  } catch (error) {
    console.error("Ingestion  error:", error);
    return NextResponse.json(
      { error: "Document ingestion failed" },
      { status: 500 }
    );
  }
}
