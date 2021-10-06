import { dayChartType } from 'src/dto/chart-response.dto';
import { StocksService } from './../services/stocks.service';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { CHART_REQUEST, CHART_RESPONSE } from './events';
import { ChartRequestDto } from 'src/dto/chart-request.dto';

@WebSocketGateway({ cors: true })
export class ChartGateway {
  @WebSocketServer()
  server: Server;

  constructor(private stocksService: StocksService) {}

  @SubscribeMessage(CHART_REQUEST)
  async handleChartRequest(
    client: Socket,
    payload: ChartRequestDto,
  ): Promise<void> {
    const { room, week, day } = payload;
    const dayChart: dayChartType = await this.stocksService.findDayChart(
      room,
      week,
      day,
    );

    // To do
    // receive request from all players in the room with item
    // check if all players requested and emit timedayChart to all players in the room

    this.server.to(room).emit(CHART_RESPONSE, dayChart);
  }
}
