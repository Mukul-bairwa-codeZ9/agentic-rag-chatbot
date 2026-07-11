import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  async chat(message: string) {
    return {
      message,
      status: 'working',
    };
  }
}