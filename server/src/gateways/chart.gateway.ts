import { StocksService } from './../services/stocks.service';
import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { CHART_REQUEST, CHART_RESPONSE } from './events';

export type timeType = {
  week: number;
  day: number;
  tick: number;
};

export type corpType = {
  ticker: string;
  corpName: string;
  price: number;
};

export type tickType = timeType & corpType;

export type timeDayTicksType = {
  week: number;
  day: number;
  dayTicks: corpType[];
};

export type chartRequestType = {
  room: string;
  week: number;
  day: number;
};

@WebSocketGateway({ cors: true })
export class ChartGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  constructor(private stocksService: StocksService) {}

  @SubscribeMessage(CHART_REQUEST)
  async handleChartRequest(
    client: Socket,
    payload: chartRequestType,
  ): Promise<void> {
    const { room, week, day } = payload;
    const timeDayTicks = await this.stocksService.findDayTicks(room, week, day);

    // To do
    // receive request from all players in the room with item
    // check if all players requested and emit timeDayTicks to all players in the room

    this.server.to(room).emit(CHART_RESPONSE, timeDayTicks);
  }
}
