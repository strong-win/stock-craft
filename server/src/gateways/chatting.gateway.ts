import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { PlayersService } from '../services/players.service';
import {
  CHATTING_SERVER_MESSAGE,
  CHATTING_CLIENT_MESSAGE,
  CHATTING_ROOM,
  CHATTING_JOIN,
} from './events';

@WebSocketGateway({ cors: true })
export class ChattingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  constructor(private playersService: PlayersService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`Client Disconnected: ${client.id}`);

    const player = await this.playersService.findByClientId(client.id);

    if (player) {
      const { clientId, name, room } = player;
      await this.playersService.delete(clientId);

      this.server.to(room).emit(CHATTING_SERVER_MESSAGE, {
        user: '관리자',
        text: `${name} 님이 퇴장하였습니다.`,
      });

      const players = await this.playersService.findByRoom(room);
      this.server.to(room).emit(CHATTING_ROOM, players);
    }
  }

  @SubscribeMessage(CHATTING_JOIN)
  async handleJoin(
    client: Socket,
    payload: { name: string; room: string },
  ): Promise<void> {
    const { name, room } = await this.playersService.create({
      ...payload,
      clientId: client.id,
    });

    client.join(room);

    client.emit(CHATTING_SERVER_MESSAGE, {
      user: '관리자',
      text: `${name} 님, 입장을 환영합니다.`,
    });

    client.broadcast.to(room).emit(CHATTING_SERVER_MESSAGE, {
      user: '관리자',
      text: `${name} 님이 방에 입장하셨습니다.`,
    });

    const players = await this.playersService.findByRoom(room);
    this.server.emit(CHATTING_ROOM, players);
  }

  @SubscribeMessage(CHATTING_CLIENT_MESSAGE)
  async handleMessage(client: Socket, message: string): Promise<void> {
    const { name, room } = await this.playersService.findByClientId(client.id);

    this.server
      .to(room)
      .emit(CHATTING_SERVER_MESSAGE, { user: name, text: message });
  }
}
