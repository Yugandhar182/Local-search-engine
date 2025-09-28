import { NextRequest, NextResponse } from "next/server";
import { documentQAStore } from "@/lib/document-qa-store";

export async function POST(request: NextRequest) {
  try {
    const { query, topK = 5 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const results = await documentQAStore.search(query, topK);

    return NextResponse.json({
      query,
      answer: results.answer,
      sources: results.sources,
      timestamp: new Date().toISOString(),
      stats: documentQAStore.getStats(),
    });
  } catch (error) {
    console.error("Search  error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
