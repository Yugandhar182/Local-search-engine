interface OllamaResponse {
  response: string;
}

export class OllamaClient {
  private baseUrl = 'http://localhost:11434';

  async generate(model: string, prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
      });

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error('Failed to connect to Ollama');
    }
  }

  async embed(model: string, text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: text,
        }),
      });

      const data = await response.json();
      return data.embedding || [];
    } catch (error) {
      console.error('Embedding error:', error);
      return [];
    }
  }
}
