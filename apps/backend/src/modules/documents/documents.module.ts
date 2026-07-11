import { Module } from '@nestjs/common';
import { DocumentLoaderService } from './document-loader/document-loader.service';

@Module({
  providers: [DocumentLoaderService],
  exports: [DocumentLoaderService], 
})
export class DocumentsModule {}