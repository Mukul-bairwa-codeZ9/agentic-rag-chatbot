import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { LoadedDocument } from '../../documents/document-loader/document-loader.service';

@Injectable()
export class EmbeddingService {
  private readonly splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 100,
  });

  private readonly embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async createChunks(documents: LoadedDocument[]) {
    const chunks: Document[] = [];

    for (const doc of documents) {
      const split = await this.splitter.createDocuments(
        [doc.content],
        [
          {
            source: doc.source,
          },
        ],
      );

      chunks.push(...split);
    }

    return chunks;
  }

  getEmbeddingModel() {
    return this.embeddings;
  }
}