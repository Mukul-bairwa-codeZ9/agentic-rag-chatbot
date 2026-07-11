import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { RouterModule } from '../router/router.module';

@Module({
  imports: [RouterModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}