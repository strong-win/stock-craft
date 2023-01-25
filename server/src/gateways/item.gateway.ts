import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ErrorInterface } from 'src/dto/error-interface';
import { ItemRequestDto } from 'src/dto/item-request.dto';
import { ItemService } from 'src/services/item.service';

import { ERROR, ITEM_REQUEST } from './events';

@WebSocketGateway()
export class ItemGateway {
  @WebSocketServer()
  private server: Server;

  constructor(private itemService: ItemService) {}

  @SubscribeMessage(ITEM_REQUEST)
  async receiveItemRequest(
    client: Socket,
    payload: ItemRequestDto,
  ): Promise<Record<string, never>> {
    try {
      await this.itemService.create(payload);
      return {};
    } catch (e) {
      const errorInstance: ErrorInterface = { message: e.message };
      this.server.to(client.id).emit(ERROR, errorInstance);
    }
  }
}
