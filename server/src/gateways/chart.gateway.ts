import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { StocksService } from 'src/services/stocks.service';
import { ItemsService } from 'src/services/items.service';
import { ChartRequestDto } from 'src/dto/chart-request.dto';
import { dayChartType } from 'src/dto/chart-response.dto';

import { CHART_REQUEST, CHART_RESPONSE } from './events';

@WebSocketGateway({ cors: true })
export class ChartGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private stocksService: StocksService,
    private itemsService: ItemsService,
  ) {}

  @SubscribeMessage(CHART_REQUEST)
  async handleChartRequest(
    client: Socket,
    payload: ChartRequestDto,
  ): Promise<void> {
    const { room, week, day, item } = payload;

    const { playerCount, itemCount } = await this.itemsService.createItem(
      client.id,
      room,
      week,
      day,
      item,
    );

    if (playerCount === itemCount) {
      const dayChart: dayChartType = await this.stocksService.findDayChart(
        room,
        week,
        day,
      );

      this.server.to(room).emit(CHART_RESPONSE, dayChart);
    }
  }
}
