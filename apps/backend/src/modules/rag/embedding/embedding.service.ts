import { Injectable } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

@Injectable()
export class EmbeddingService {
  // We chunk the text into blocks of 1000 characters, with 200 characters of overlap
  // so we don't accidentally cut a sentence in half!
  private readonly splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  async createChunks(documents: { source: string; content: string }[]) {
    const chunks: Document[] = [];

    for (const doc of documents) {
      // Split the raw text and attach the filename as metadata for citations
      const splitDocs = await this.splitter.createDocuments(
        [doc.content],
        [{ source: doc.source }] 
      );
      chunks.push(...splitDocs);
    }

    return chunks;
  }
}