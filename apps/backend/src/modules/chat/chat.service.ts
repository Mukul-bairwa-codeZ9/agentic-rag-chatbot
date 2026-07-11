import { Injectable } from '@nestjs/common';
import { RouterService } from '../router/router.service';

@Injectable()
export class ChatService {
  constructor(private readonly routerService: RouterService) {}

  async chat(message: string) {
    return this.routerService.routeAndExecute(message);
  }
}