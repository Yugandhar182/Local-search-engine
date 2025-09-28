import { OllamaClient } from './ollama-client';

interface StoredDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    filename: string;
    uploadDate: string;
  };
}

export class DocumentQAStore {
  private documents: Map<string, StoredDocument> = new Map();
  private ollama: OllamaClient;

  constructor() {
    this.ollama = new OllamaClient();
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    
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

  async addDocument(content: string, filename?: string): Promise<{success: boolean; documentId: string}> {
    const docId = filename || Date.now().toString();
    
    try {
      const embedding = await this.ollama.embed('nomic-embed-text', content);
      
      const document: StoredDocument = {
        id: docId,
        content,
        embedding,
        metadata: {
          filename: filename || 'untitled',
          uploadDate: new Date().toISOString(),
        }
      };

      this.documents.set(docId, document);
      
      console.log(`Document stored: ${docId} (${this.documents.size} total documents)`);
      return { success: true, documentId: docId };

    } catch {
      console.error('Document storage error');
      throw new Error('Failed to store document');
    }
  }

  async search(query: string, topK: number = 5): Promise<{
    answer: string;
    sources: Array<{
      content: string;
      score: number;
      metadata: Record<string, string>;
    }>;
  }> {
    if (this.documents.size === 0) {
      return {
        answer: "No documents have been added yet. Please add some documents first.",
        sources: [],
      };
    }

    try {
      const queryEmbedding = await this.ollama.embed('nomic-embed-text', query);
      
      const documentScores = Array.from(this.documents.values()).map(doc => ({
        ...doc,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

      if (documentScores.length === 0 || documentScores[0].score < 0.1) {
        return {
          answer: `I couldn't find relevant information in your documents to answer "${query}". Please check if you've added the right documents.`,
          sources: [],
        };
      }

      const relevantDocs = documentScores.filter(doc => doc.score > 0.1);
      const context = relevantDocs.map(doc => doc.content).join('\n\n');
      
      const prompt = `Based ONLY on the following documents, answer the question. If the answer is not in the documents, say "I don't have that information in the documents."

Documents:
${context}

Question: ${query}

Answer based only on the documents above:`;

      let answer: string;
      try {
        answer = await this.ollama.generate('llama3.2:1b', prompt);
      } catch {
        answer = `Based on your documents: ${context.substring(0, 300)}...`;
      }

      const sources = relevantDocs.map(doc => ({
        content: doc.content,
        score: doc.score,
        metadata: {
          filename: doc.metadata.filename,
          uploadDate: doc.metadata.uploadDate,
        },
      }));

      return { answer, sources };

    } catch {
      return {
        answer: "Search failed due to an error.",
        sources: [],
      };
    }
  }

  getStats() {
    return {
      totalDocuments: this.documents.size,
      documentsWithEmbeddings: this.documents.size,
    };
  }
}

export const documentQAStore = new DocumentQAStore();
