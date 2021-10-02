import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { TRADE_REFRESH, TRADE_REQUEST } from './events';

type TradeRequestType = {
  code: string;
  week: number;
  day: number;
  tick: number;
  corpName: string;
  price: number;
  quantity: number;
  deal: string;
};

type TradeRefreshType = {
  code: string;
  week: number;
  day: number;
  tick: number;
};

@WebSocketGateway({ cors: true })
export class TradeGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage(TRADE_REQUEST)
  receiveTradeRequest(client: Socket, payload: TradeRequestType): any {
    console.log(payload);
    return 'Hello world!';
  }

  @SubscribeMessage(TRADE_REFRESH)
  receiveTradeRefresh(client: Socket, payload: TradeRefreshType): any {
    console.log(payload);
    return 'Hello world!';
  }
}
