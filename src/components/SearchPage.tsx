"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  query: string;
  answer: string;
  sources: Array<{
    content: string;
    score: number;
    metadata: Record<string, string>;
  }>;
  stats: {
    totalDocuments: number;
    documentsWithEmbeddings: number;
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, topK: 5 }),
      });

      const data = await response.json();
      setResults(data);
      
      // Add to search history
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (quickQuery: string) => {
    setQuery(quickQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Search Your Documents
          </h1>
          <p className="text-gray-600">
            Ask questions about your uploaded documents
          </p>
        </div>

        {/* Navigation */}
        <div className="text-center mb-6">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload More Documents
          </button>
        </div>

        {/* Search Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ask a question about your documents..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                disabled={loading}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            {/* Quick Search Buttons */}
            {searchHistory.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((historyQuery, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSearch(historyQuery)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {historyQuery}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results?.stats && (
              <div className="text-sm text-gray-600">
                Searching through {results.stats.totalDocuments} documents
              </div>
            )}
          </div>

          {/* Search Results */}
          {results && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Answer:</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-800 leading-relaxed">{results.answer}</p>
                </div>
              </div>

              {results.sources.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Sources ({results.sources.length}):
                  </h3>
                  <div className="space-y-4">
                    {results.sources.map((source, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-blue-600">
                            {source.metadata.filename}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Score: {source.score.toFixed(3)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {source.content.substring(0, 300)}
                          {source.content.length > 300 && "..."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!results && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Ready to Search</h3>
              <p className="text-gray-500">Enter your question above to search through your documents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
