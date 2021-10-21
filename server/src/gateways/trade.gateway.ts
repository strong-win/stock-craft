import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { TRADE_CANCEL, TRADE_REQUEST, TRADE_RESPONSE } from './events';
import { TradeRequestDto } from 'src/dto/trade-request.dto';
import { TradeCancelDto } from 'src/dto/trade-cancel.dto';
import { TradeService } from 'src/services/trade.service';

@WebSocketGateway({ cors: true })
export class TradeGateway {
  @WebSocketServer()
  server: Server;

  constructor(private tradeService: TradeService) {}

  @SubscribeMessage(TRADE_REQUEST)
  async receiveTradeRequest(
    client: Socket,
    payload: TradeRequestDto,
  ): Promise<void> {
    try {
      const player = await this.tradeService.handleTrade(payload);
      this.server.to(client.id).emit(TRADE_RESPONSE, player);
    } catch (e) {
      console.error(e);

      if (e.name === 'TradeException') {
        // To do
        // handle TradeException
      }
    }
  }

  @SubscribeMessage(TRADE_CANCEL)
  async receiveTradeCancel(
    client: Socket,
    payload: TradeCancelDto,
  ): Promise<void> {
    const player = await this.tradeService.handleTradeCancel(payload);
    this.server.to(client.id).emit(TRADE_RESPONSE, player);
  }
}
