import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlayerStatus } from 'src/schemas/player.schema';

import { PlayerService } from 'src/services/player.service';
import { CHATTING_SERVER_MESSAGE, CHATTING_CLIENT_MESSAGE } from './events';

@WebSocketGateway({ cors: true })
export class ChattingGateway {
  @WebSocketServer()
  server: Server;

  constructor(private playerService: PlayerService) {}

  @SubscribeMessage(CHATTING_CLIENT_MESSAGE)
  async handleMessage(
    client: Socket,
    payload: { playerId: string; message: string },
  ): Promise<void> {
    const { playerId, message } = payload;
    const { name, room, status } = await this.playerService.findByPlayerId(
      playerId,
    );

    this.server.to(room).emit(CHATTING_SERVER_MESSAGE, {
      user: name,
      text: message,
      statuses: this.getStatuses(status),
    });
  }

  getStatuses(status: PlayerStatus | 'all'): PlayerStatus[] {
    if (status == 'all') {
      return ['connected', 'ready', 'play'];
    }
    if (status === 'connected' || status === 'ready') {
      return ['connected', 'ready'];
    }
    if (status === 'play') {
      return ['play'];
    }
  }
}
