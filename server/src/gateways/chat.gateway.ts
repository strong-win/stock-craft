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
  CHAT_SERVER_MESSAGE,
  CHAT_CLIENT_MESSAGE,
  CHAT_ROOM,
  CHAT_JOIN,
} from '../events/index.events';
import { response } from '../dto/response.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
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

      this.server.to(room).emit(CHAT_SERVER_MESSAGE, {
        user: '관리자',
        text: `${name} 님이 퇴장하였습니다.`,
      });

      const users = await this.playersService.findByRoom(room);
      this.server.to(room).emit(CHAT_ROOM, { users, room });
    }
  }

  @SubscribeMessage(CHAT_JOIN)
  async handleJoin(
    client: Socket,
    payLoad: { name: string; room: string },
  ): Promise<void> {
    const { name, room } = await this.playersService.create({
      ...payLoad,
      clientId: client.id,
    });

    client.join(room);

    client.emit(CHAT_SERVER_MESSAGE, {
      user: '관리자',
      text: `${name} 님, 입장을 환영합니다.`,
    });

    client.broadcast.to(room).emit(CHAT_SERVER_MESSAGE, {
      user: '관리자',
      text: `${name} 님이 방에 입장하셨습니다.`,
    });

    const users = await this.playersService.findByRoom(room);
    this.server.emit(CHAT_ROOM, { room, users });
  }

  @SubscribeMessage(CHAT_CLIENT_MESSAGE)
  async handleMessage(client: Socket, message: string): Promise<response> {
    const { name, room } = await this.playersService.findByClientId(client.id);

    this.server
      .to(room)
      .emit(CHAT_SERVER_MESSAGE, { user: name, text: message });

    return { status: 'OK' };
  }
}
