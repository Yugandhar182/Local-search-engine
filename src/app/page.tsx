import SearchInterface from "@/components/SearchInterface";
import DocumentUpload from "@/components/DocumentUpload";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          Local Search Engine
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Powered by Ollama + ChromaDB + Next.js - Completely Offline
        </p>
        
        <SearchInterface />
        <DocumentUpload />
        
        <div className="max-w-4xl mx-auto mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Setup Requirements:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>1. Ollama running on localhost:11434</li>
            <li>2. ChromaDB running on localhost:8000</li>
            <li>3. Models: llama3.2:1b, nomic-embed-text</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
