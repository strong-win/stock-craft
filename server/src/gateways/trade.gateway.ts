import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ERROR, TRADE_CANCEL, TRADE_REQUEST, TRADE_RESPONSE } from './events';
import { TradeRequestDto } from 'src/dto/trade-request.dto';
import { TradeCancelDto } from 'src/dto/trade-cancel.dto';
import { TradeService } from 'src/services/trade.service';
import { ErrorInterface } from 'src/dto/error-interface';

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
      const tradeResponseDto = await this.tradeService.handleTrade(payload);
      this.server.to(client.id).emit(TRADE_RESPONSE, tradeResponseDto);
    } catch (e) {
      const errorInstance: ErrorInterface = { message: e.message };
      this.server.to(client.id).emit(ERROR, errorInstance);
    }
  }

  @SubscribeMessage(TRADE_CANCEL)
  async receiveTradeCancel(
    client: Socket,
    payload: TradeCancelDto,
  ): Promise<void> {
    try {
      const tradeResponseDto = await this.tradeService.handleTradeCancel(
        payload,
      );
      this.server.to(client.id).emit(TRADE_RESPONSE, tradeResponseDto);
    } catch (e) {
      const errorInstance: ErrorInterface = { message: e.message };
      this.server.to(client.id).emit(ERROR, errorInstance);
    }
  }
}
