import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ItemRequestDto } from 'src/dto/item-request.dto';
import { ItemService } from 'src/services/item.service';

import { ITEM_REQUEST } from './events';

@WebSocketGateway()
export class ItemGateway {
  @WebSocketServer()
  private server: Server;

  constructor(private itemService: ItemService) {}

  @SubscribeMessage(ITEM_REQUEST)
  async receiveItemRequest(
    client: Socket,
    payload: ItemRequestDto,
  ): Promise<void> {
    await this.itemService.create(payload);
  }
}
