import { GameService } from 'src/services/game.service';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ItemRequestDto } from 'src/dto/item-request.dto';
import { EffectResponse, EffectService } from 'src/services/effect.service';
import { ItemService } from 'src/services/item.service';

import { ITEM_REQUEST, ITEM_RESPONSE } from './events';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  private server: Server;

  constructor(
    private itemService: ItemService,
    private gameService: GameService,
    private effectService: EffectService,
  ) {}

  @SubscribeMessage(ITEM_REQUEST)
  async receiveItemRequest(client: any, payload: ItemRequestDto) {
    await this.itemService.create(payload);
  }
}
