import { Module } from '@nestjs/common';
import { SqlService } from './sql.service';
import { DatabaseService } from './database.service';

@Module({
  providers: [SqlService, DatabaseService],
  exports: [SqlService], 
})
export class SqlModule {}