import { Injectable } from '@nestjs/common';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';

@Injectable()
export class RetrieverService {
  private vectorStore!: Chroma;

  async initialize() {
    this.vectorStore = await Chroma.fromExistingCollection(
      new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
      }),
      {
        collectionName: 'northwind-documents',
        url: 'http://localhost:8000',
      },
    );
  }

  async retrieve(query: string) {
    return this.vectorStore.similaritySearch(query, 4);
  }
}