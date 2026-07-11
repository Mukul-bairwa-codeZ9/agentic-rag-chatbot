import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { RetrieverService } from './retriever/retriever.service';

@Injectable()
export class RagService {
  constructor(private readonly retriever: RetrieverService) {}

  private readonly llm = new ChatOpenAI({
    model: 'gpt-4.1-mini',
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY,
  });

  async ask(question: string) {
    const docs = await this.retriever.retrieve(question);

    const context = docs.map((d) => d.pageContent).join('\n\n');

    const response = await this.llm.invoke(`
You are a helpful assistant.

Use ONLY the context below.

If answer is missing, say you don't know.

Context:
${context}

Question:
${question}
`);

    return {
      answer: response.content,
      citations: docs.map((d) => d.metadata.source),
    };
  }
}