"use client";

import { useState } from "react";

interface SearchResult {
  query: string;
  answer: string;
  sources: Array<{
    content: string;
    score: number;
    metadata: Record<string, string>;
  }>;
}

export default function SearchInterface() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'sources'>('results');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setActiveTab('results'); // Always show results tab first when searching
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, topK: 5 }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Search Engine</h2>
        </div>

        {/* Search Input */}
        <div className="flex space-x-2 mb-6">
          <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search here..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
          />
          <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Results Section with Tabs */}
        {results && (
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                      onClick={() => setActiveTab('results')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === 'results'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Search Results
                  </button>
                  <button
                      onClick={() => setActiveTab('sources')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === 'sources'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Sources ({results.sources.length})
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-4">
                {/* Results Tab */}
                {activeTab === 'results' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Result:</h3>
                      <p className="text-gray-800">{results.answer}</p>
                    </div>
                )}

                {/* Sources Tab */}
                {activeTab === 'sources' && results.sources.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-4">
                        Document Sources ({results.sources.length}):
                      </h3>
                      <div className="space-y-3">
                        {results.sources.map((source, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">File:</span> {source.metadata.filename}
                                </div>
                                <div className="text-sm text-gray-500">
                                  <span className="font-medium">Score:</span> {source.score?.toFixed(3)}
                                </div>
                              </div>
                              <div className="text-gray-800 leading-relaxed">
                                {source.content.length > 400
                                    ? `${source.content.substring(0, 400)}...`
                                    : source.content
                                }
                              </div>
                              {source.content.length > 400 && (
                                  <button className="text-blue-600 text-sm mt-2 hover:text-blue-800">
                                    Show more
                                  </button>
                              )}
                            </div>
                        ))}
                      </div>
                    </div>
                )}

                {/* Empty Sources State */}
                {activeTab === 'sources' && results.sources.length === 0 && (
                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                      <div className="text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No sources found</p>
                        <p className="text-sm">This search didnt return any document sources.</p>
                      </div>
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  );
}