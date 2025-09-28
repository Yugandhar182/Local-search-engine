// pages/index.js or app/page.js
"use client";

import { useState } from "react";
import SearchInterface from "@/components/SearchInterface";
import DocumentUpload from "@/components/DocumentUpload";

export default function Home() {
    const [currentPage, setCurrentPage] = useState("upload"); // "upload" or "search"

    const goToSearch = () => {
        setCurrentPage("search");
    };

    const goToUpload = () => {
        setCurrentPage("upload");
    };

    return (
        <main className="min-h-screen bg-gray-100">
            <div className="container mx-auto py-8">
                <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
                    Search Engine
                </h1>

                {/* Page Navigation */}
                <div className="flex justify-center mb-6">
                    <div className="flex space-x-4">
                        <button
                            onClick={goToUpload}
                            className={`px-4 py-2 rounded-lg ${
                                currentPage === "upload"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Add Documents
                        </button>
                        <button
                            onClick={goToSearch}
                            className={`px-4 py-2 rounded-lg ${
                                currentPage === "search"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Render current page */}
                {currentPage === "upload" && (
                    <div>
                        <DocumentUpload />
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={goToSearch}
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-lg font-semibold"
                            >
                                Next: Go to Search →
                            </button>
                        </div>
                    </div>
                )}

                {currentPage === "search" && (
                    <div>
                        <SearchInterface />
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={goToUpload}
                                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-lg font-semibold"
                            >
                                ← Back to Add Documents
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}