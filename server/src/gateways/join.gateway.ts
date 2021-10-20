import { JoinService } from './../services/join.service';
import {
  CHATTING_SERVER_MESSAGE,
  JOIN_CANCEL,
  JOIN_CONNECTED,
  JOIN_HOST,
  JOIN_PLAY,
  JOIN_PLAYERS,
  JOIN_READY,
  JOIN_START,
} from './events';
import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Player, PlayerInfo, PlayerStatus } from 'src/schemas/players.schema';
import { PlayersService } from 'src/services/players.service';
import { GamesService } from 'src/services/games.service';

@WebSocketGateway()
export class JoinGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  constructor(
    private playersService: PlayersService,
    private joinService: JoinService,
    private gamesService: GamesService,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`Client Disconnected: ${client.id}`);

    // find player with clientId only
    const player = await this.playersService.findByClientIdAndStatuses(
      client.id,
      this.getStatuses('all'),
    );

    if (player) {
      const { _id: playerId, name, room, status, isHost } = player;
      await this.playersService.updateByPlayerId(playerId, {
        status: 'disconnected',
      });

      this.server.to(room).emit(CHATTING_SERVER_MESSAGE, {
        user: '관리자',
        text: `${name} 님이 퇴장하였습니다.`,
        statuses: this.getStatuses(status),
      });

      const players = await this.playersService.findByRoomAndStatuses(
        room,
        this.getStatuses('all'),
      );
      const playersInfo: PlayerInfo[] = players.map(({ name, status }) => ({
        name,
        status,
      }));

      if (isHost && players.length) {
        const newHost = players[0];
        this.server.to(newHost.clientId).emit(JOIN_HOST, { isHost: true });
        this.server.to(newHost.clientId).emit(CHATTING_SERVER_MESSAGE, {
          user: '관리자',
          text: `${newHost.name} 님이 새로운 방장이 되었습니다.`,
          statuses: this.getStatuses(status),
        });
      }
      // emit playersInfo to wait room
      this.server.to(room).emit(JOIN_PLAYERS, playersInfo);
    }
  }

  @SubscribeMessage(JOIN_CONNECTED)
  async receiveJoinConnected(
    client: Socket,
    payload: { name: string; room: string; isHost: boolean },
  ): Promise<{ playerId: string }> {
    const {
      _id: playerId,
      name,
      room,
    } = await this.playersService.create({
      ...payload,
      clientId: client.id,
      status: 'connected',
    });

    client.join(room);

    client.emit(CHATTING_SERVER_MESSAGE, {
      user: '관리자',
      text: `${name} 님, 대기실 입장을 환영합니다.`,
      statuses: this.getStatuses('connected'),
    });

    client.broadcast.to(room).emit(CHATTING_SERVER_MESSAGE, {
      user: '관리자',
      text: `${name} 님이 대기실에 입장하셨습니다.`,
      statuses: this.getStatuses('connected'),
    });

    const players: Player[] = await this.playersService.findByRoomAndStatuses(
      room,
      this.getStatuses('all'),
    );
    const playersInfo: PlayerInfo[] = players.map(({ name, status }) => ({
      name,
      status,
    }));
    this.server.emit(JOIN_PLAYERS, playersInfo);

    return { playerId };
  }

  @SubscribeMessage(JOIN_READY)
  async receiveJoinReady(
    client: Socket,
    payload: { playerId: string; room: string },
  ): Promise<void> {
    const { playerId, room } = payload;
    await this.playersService.updateByPlayerId(playerId, { status: 'ready' });

    const players: Player[] = await this.playersService.findByRoomAndStatuses(
      room,
      this.getStatuses('all'),
    );
    const playersInfo: PlayerInfo[] = players.map(({ name, status }) => ({
      name,
      status,
    }));
    this.server.to(room).emit(JOIN_PLAYERS, playersInfo);
  }

  @SubscribeMessage(JOIN_CANCEL)
  async receiveJoinCancel(
    client: Socket,
    payload: { playerId: string; room: string },
  ): Promise<void> {
    const { playerId, room } = payload;
    await this.playersService.updateByPlayerId(playerId, {
      status: 'connected',
    });

    const players: Player[] = await this.playersService.findByRoomAndStatuses(
      room,
      this.getStatuses('all'),
    );

    const playersInfo: PlayerInfo[] = players.map(({ name, status }) => ({
      name,
      status,
    }));
    this.server.to(room).emit(JOIN_PLAYERS, playersInfo);
  }

  @SubscribeMessage(JOIN_START)
  async receiveJoinStart(
    client: Socket,
    payload: { playerId: string; room: string },
  ): Promise<void> {
    const { playerId, room } = payload;
    const { playersInfo, gameInfo, start } = await this.joinService.startGame(
      playerId,
      room,
    );

    if (start) {
      this.server.to(room).emit(JOIN_PLAYERS, playersInfo);

      this.server.to(room).emit(JOIN_PLAY, gameInfo);

      this.server.to(room).emit(CHATTING_SERVER_MESSAGE, {
        user: '관리자',
        text: '게임을 시작합니다.',
        statuses: this.getStatuses('play'),
      });

      this.gamesService.createGame(gameInfo.gameId.toString(), room);
    } else {
      this.server.to(room).emit(CHATTING_SERVER_MESSAGE, {
        user: '관리자',
        text: '모든 유저가 레디 상태가 아니므로 게임을 시작할 수 없습니다.',
        statuses: this.getStatuses('connected'),
      });
    }
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
