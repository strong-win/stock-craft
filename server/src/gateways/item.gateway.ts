import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ItemRequestDto } from 'src/dto/item-request.dto';
import { ItemService } from 'src/services/item.service';

import { ITEM_REQUEST } from './events';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  private server: Server;

  constructor(private itemService: ItemService) {}

  @SubscribeMessage(ITEM_REQUEST)
  async receiveItemRequest(client: any, payload: ItemRequestDto) {
    await this.itemService.create(payload);
  }
}
