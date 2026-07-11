import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

export interface LoadedDocument {
  id: string;
  source: string;
  content: string;
}

@Injectable()
export class DocumentLoaderService {
  private readonly logger = new Logger(DocumentLoaderService.name);

  private readonly documentsPath =
    process.env.DOCUMENTS_PATH ||
    path.join(process.cwd(), 'src/data/documents');

  async loadDocuments(): Promise<LoadedDocument[]> {
    const files = await fs.readdir(this.documentsPath);

    const pdfs = files.filter((f) => f.endsWith('.pdf'));

    const docs: LoadedDocument[] = [];

    for (const file of pdfs) {
      this.logger.log(`Loading ${file}`);

      const buffer = await fs.readFile(path.join(this.documentsPath, file));

      const parsed = await pdfParse(buffer);

      docs.push({
        id: file.replace('.pdf', ''),
        source: file,
        content: parsed.text.replace(/\s+/g, ' ').trim(),
      });
    }

    this.logger.log(`${docs.length} documents loaded`);

    return docs;
  }
}