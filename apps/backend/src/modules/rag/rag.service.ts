import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { RetrieverService } from './retriever/retriever.service';

@Injectable()
export class RagService {
  private readonly llm: ChatOpenAI;

  constructor(private readonly retriever: RetrieverService) {
    this.llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,       // Groq Key
      configuration: {
        baseURL: process.env.OPENAI_BASE_URL,  // Groq Base URL
      },
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
    });
  }

  async ask(question: string) {
    const docs = await this.retriever.retrieve(question);
    const context = docs.map((d) => d.pageContent).join('\n\n');

    const response = await this.llm.invoke(`
      You are a helpful assistant answering strictly based on the provided company policies.
      If the answer is not in the context, say you do not know.
      
      Context: ${context}
      
      Question: ${question}
    `);

    return {
      tool: 'RAG',
      answer: response.content,
      citations: docs.map((d) => d.metadata.source),
    };
  }
}