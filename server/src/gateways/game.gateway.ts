import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { assetType } from 'src/schemas/players.schema';
import { GamesService } from 'src/services/games.service';
import { PlayersService } from 'src/services/players.service';
import { GAME_START_REQUEST, GAME_START_RESPONSE } from './events';

@WebSocketGateway({ cors: true })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private gameService: GamesService,
    private playersService: PlayersService,
  ) {}

  @SubscribeMessage(GAME_START_REQUEST)
  async gameStartRequest(client: Socket, payload: { room: string }) {
    const { room } = payload;
    const corps = await this.gameService.findCorpNames(room);
    const clients = await this.playersService.findByRoom(room);

    const assets: assetType[] = [];
    for (const corp of corps) {
      assets.push({ corpId: corp.corpId, quantity: 0 });
    }

    const clientIds = clients.map((client) => client.clientId);
    await this.playersService.updateAssetByClientId(clientIds, assets);

    this.server.to(client.id).emit(GAME_START_RESPONSE, { corps });
  }
}
