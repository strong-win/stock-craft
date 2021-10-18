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
import { TradeResponseDto } from 'src/dto/trade-response.dto';
import { TradeCancelDto } from 'src/dto/trade-cancel.dto';

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
      const player = await this.tradesService.handleTrade(payload);
      this.server.to(client.id).emit(TRADE_RESPONSE, player);
    } catch (e) {
      console.error(e);

      if (e.name === 'TradeException') {
        // To do
        // handle TradeException
      }
    }
  }

  @SubscribeMessage(TRADE_REFRESH)
  async receiveTradeRefresh(
    client: Socket,
    payload: TradeRefreshDto,
  ): Promise<void> {
    const player: TradeResponseDto = await this.tradesService.handleRefresh(
      payload,
    );
    this.server.to(client.id).emit(TRADE_RESPONSE, player);
  }

  @SubscribeMessage(TRADE_CANCEL)
  async receiveTradeCancel(
    client: Socket,
    payload: TradeCancelDto,
  ): Promise<void> {
    const player = await this.tradesService.handleTradeCancel(payload);
    this.server.to(client.id).emit(TRADE_RESPONSE, player);
  }
}
