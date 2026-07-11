import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './modules/chat/chat.module';
import { RagModule } from './modules/rag/rag.module';
import { SqlModule } from './modules/sql/sql.module';
import { RouterModule } from './modules/router/router.module';
import { DocumentsModule } from './modules/documents/documents.module';

@Module({
  imports: [ChatModule, RagModule, SqlModule, RouterModule, DocumentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
