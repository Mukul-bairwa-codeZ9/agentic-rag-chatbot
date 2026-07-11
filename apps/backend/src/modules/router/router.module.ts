import { Module } from '@nestjs/common';
import { RouterService } from './router.service';
import { RagModule } from '../rag/rag.module';
import { SqlModule } from '../sql/sql.module';

@Module({
  imports: [RagModule, SqlModule],
  providers: [RouterService],
  exports: [RouterService],
})
export class RouterModule {}