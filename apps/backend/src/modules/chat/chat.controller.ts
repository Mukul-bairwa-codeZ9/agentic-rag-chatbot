import { Body, Controller, Post } from '@nestjs/common';

import { ChatDto } from './dto/chat.dto';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  @Post()
  async chat(@Body() dto: ChatDto) {
    return this.chatService.chat(dto.message);
  }
}