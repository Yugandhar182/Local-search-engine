import { OllamaClient } from './ollama-client';

interface Document {
  id: string;
  content: string;
  embedding?: number[];
  metadata: {
    filename: string;
    uploadDate: string;
  };
}

interface SearchSource {
  content: string;
  score: number;
  metadata: {
    filename: string;
    uploadDate: string;
  };
}

export class LocalSearchEngine {
  private documents: Document[] = [];
  private ollama: OllamaClient;

  constructor() {
    this.ollama = new OllamaClient();
  }

  async addDocument(content: string, filename?: string): Promise<{success: boolean; documentId: string}> {
    const doc: Document = {
      id: filename || Date.now().toString(),
      content,
      metadata: {
        filename: filename || 'untitled',
        uploadDate: new Date().toISOString(),
      },
    };

    // Generate embedding for semantic search
    try {
      doc.embedding = await this.ollama.embed('nomic-embed-text', content);
    } catch {
      console.log('Embedding failed, using text search only');
    }

    this.documents.push(doc);
    return { success: true, documentId: doc.id };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async search(query: string, topK: number = 5): Promise<{
    answer: string;
    sources: SearchSource[];
  }> {
    if (this.documents.length === 0) {
      return {
        answer: "No documents have been indexed yet. Please add some documents first.",
        sources: [],
      };
    }

    let rankedDocs = this.documents;

    // Try semantic search if embeddings are available
    try {
      const queryEmbedding = await this.ollama.embed('nomic-embed-text', query);
      
      if (queryEmbedding.length > 0) {
        rankedDocs = this.documents
          .filter(doc => doc.embedding && doc.embedding.length > 0)
          .map(doc => ({
            ...doc,
            score: this.cosineSimilarity(queryEmbedding, doc.embedding!),
          }))
          .sort((a, b) => (b.score || 0) - (a.score || 0));
      }
    } catch {
      console.log('Semantic search failed, falling back to text search');
    }

    // Fallback to text search
    if (!rankedDocs.some(doc => 'score' in doc)) {
      rankedDocs = this.documents
        .map(doc => ({
          ...doc,
          score: doc.content.toLowerCase().includes(query.toLowerCase()) ? 1.0 : 0.1,
        }))
        .sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    const topDocs = rankedDocs.slice(0, topK);
    const context = topDocs.map(doc => doc.content).join('\n\n');

    // Generate answer using Ollama
    let answer: string;
    try {
      const prompt = `Based on the following documents, answer the question: "${query}"

Documents:
${context}

Please provide a helpful answer based on the information in the documents:`;

      answer = await this.ollama.generate('llama3.2:1b', prompt);
    } catch {
      answer = `Found ${topDocs.length} relevant documents. Here's a summary of the content: ${context.substring(0, 300)}...`;
    }

    return {
      answer,
      sources: topDocs.map(doc => ({
        content: doc.content,
        score: (doc as Document & { score?: number }).score || 0,
        metadata: doc.metadata,
      })),
    };
  }
}

export const searchEngine = new LocalSearchEngine();
