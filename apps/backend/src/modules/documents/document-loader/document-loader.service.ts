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
    const files = await fs.readdir(env.documentsPath);
    const pdfFiles = files.filter((f) => f.endsWith('.pdf'));
    const documents: LoadedDocument[] = [];

    for (const file of pdfFiles) {
      this.logger.log(`Loading ${file}`);
      const filePath = path.join(env.documentsPath, file);

      try {
        // Use LangChain's official PDF loader to bypass compiler quirks entirely
        const loader = new PDFLoader(filePath);
        const loadedDocs = await loader.load();

        // LangChain splits by page. We map and join them into a single string.
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