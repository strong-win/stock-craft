import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ItemRequestDto } from 'src/dto/item-request.dto';
import { ItemsService } from 'src/services/items.service';
import { ITEM_REQUEST } from './events';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  private server: Server;

  constructor(private itemsService: ItemsService) {}

  @SubscribeMessage(ITEM_REQUEST)
  async receiveItemRequest(client: any, payload: ItemRequestDto) {
    this.itemsService.create(payload);
  }
}
