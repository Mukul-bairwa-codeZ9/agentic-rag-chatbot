import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory'; 
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { DocumentLoaderService } from '../../documents/document-loader/document-loader.service';
import { env } from '../../../config/env.config';

@Injectable()
export class RetrieverService implements OnModuleInit {
  private readonly logger = new Logger(RetrieverService.name);
  private vectorStore: MemoryVectorStore;

  constructor(private readonly documentLoaderService: DocumentLoaderService) {}

  async onModuleInit() {
    this.logger.log('Starting in-memory document ingestion...');
    
    // 1. Load the text from the PDFs
    const docs = await this.documentLoaderService.loadDocuments();
    
    // 2. Map to LangChain's expected format
    const langchainDocs = docs.map(doc => ({
      pageContent: doc.content,
      metadata: { source: doc.source }
    }));

    // 3. THE FIX: Use the exact recognized model name: gemini-embedding-001
    this.vectorStore = await MemoryVectorStore.fromDocuments(
      langchainDocs,
      new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY || env.google?.apiKey,
        model: "gemini-embedding-001", 
      })
    );
    
    this.logger.log('Documents successfully vectorized in memory!');
  }

  async retrieve(question: string) {
    if (!this.vectorStore) {
      this.logger.error('Vector store not initialized yet!');
      return [];
    }
    return this.vectorStore.similaritySearch(question, 4);
  }
}