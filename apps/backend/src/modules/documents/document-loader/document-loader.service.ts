import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { env } from '../../../config/env.config';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

export interface LoadedDocument {
  id: string;
  source: string;
  content: string;
}

@Injectable()
export class DocumentLoaderService {
  private readonly logger = new Logger(DocumentLoaderService.name);

  async loadDocuments(): Promise<LoadedDocument[]> {
    // 1. Safety Check: Verify directory exists before attempting to read
    try {
      await fs.access(env.documentsPath);
    } catch (error) {
      this.logger.warn(`Directory not found at ${env.documentsPath}. Skipping document ingestion.`);
      return []; // Return an empty array so the app boots successfully
    }

    // 2. Proceed only if the directory exists
    const files = await fs.readdir(env.documentsPath);
    const pdfFiles = files.filter((f) => f.endsWith('.pdf'));
    const documents: LoadedDocument[] = [];

    for (const file of pdfFiles) {
      this.logger.log(`Loading ${file}`);
      const filePath = path.join(env.documentsPath, file);

      try {
        const loader = new PDFLoader(filePath);
        const loadedDocs = await loader.load();

        const fullText = loadedDocs.map(doc => doc.pageContent).join(' ');

        documents.push({
          id: file.replace('.pdf', ''),
          source: file,
          content: fullText.replace(/\s+/g, ' ').trim(),
        });
      } catch (error) {
        this.logger.error(`Failed to parse ${file}: ${error}`);
      }
    }

    this.logger.log(`${documents.length} documents loaded.`);
    return documents;
  }
}