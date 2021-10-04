import { TradesService } from '../services/trades.service';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import {
  TRADE_CANCEL,
  TRADE_REFRESH,
  TRADE_REQUEST,
  TRADE_RESPONSE,
} from './events';
import { TradeRequestDto } from 'src/dto/trade-request.dto';
import { TradeRefreshDto } from 'src/dto/trade-refresh.dto';

@WebSocketGateway({ cors: true })
export class TradeGateway {
  @WebSocketServer()
  server: Server;

  constructor(private tradesService: TradesService) {}

  @SubscribeMessage(TRADE_REQUEST)
  async receiveTradeRequest(
    client: Socket,
    payload: TradeRequestDto,
  ): Promise<void> {
    try {
      console.log(payload);
      const player = await this.tradesService.handleTrade(client.id, payload);
      this.server.to(client.id).emit(TRADE_RESPONSE, player);
    } catch (e) {
      console.log(e);

      if (e.name === 'TradeException') {
        // To do
        // handle TradeException
      }
    }
  }

  @SubscribeMessage(TRADE_CANCEL)
  async receiveTradeCancel(
    client: Socket,
    payload: { corpId: string },
  ): Promise<void> {
    const player = await this.tradesService.handleTradeCancel(
      client.id,
      payload.corpId,
    );
    this.server.to(client.id).emit(TRADE_RESPONSE, player);
  }

  @SubscribeMessage(TRADE_REFRESH)
  async receiveTradeRefresh(
    client: Socket,
    payload: TradeRefreshDto,
  ): Promise<void> {
    const { room, week, day, tick } = payload;
    const player = await this.tradesService.handleRefresh(
      room,
      client.id,
      week,
      day,
      tick,
    );
    console.log(player);
    this.server.to(client.id).emit(TRADE_RESPONSE, player);
  }
}
