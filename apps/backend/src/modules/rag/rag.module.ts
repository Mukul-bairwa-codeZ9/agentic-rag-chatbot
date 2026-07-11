import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { EmbeddingService } from './embedding/embedding.service';
import { RetrieverService } from './retriever/retriever.service';
import { RagService } from './rag.service';

@Module({
  imports: [DocumentsModule],
  providers: [
    EmbeddingService, 
    RetrieverService, 
    RagService
  ],
  exports: [
    RagService, 
    EmbeddingService, 
    RetrieverService
  ],
})
export class RagModule {}