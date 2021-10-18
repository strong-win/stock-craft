import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { StocksService } from 'src/services/stocks.service';
import { ItemsService } from 'src/services/items.service';
import { DAY_END, DAY_START } from './events';
import { DayEndRequestDto } from 'src/dto/day-end.dto';
import {
  DayChart,
  DayStartRequestDto,
  DayStartResponseDto,
} from 'src/dto/day-start.dto';

@WebSocketGateway({ cors: true })
export class ChartGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private stocksService: StocksService,
    private itemsService: ItemsService,
  ) {}

  @SubscribeMessage(DAY_END)
  async handleDayEnd(
    client: Socket,
    payload: DayEndRequestDto,
  ): Promise<DayStartRequestDto> {
    const { playerCount, itemCount } = await this.itemsService.createItem(
      payload,
    );

    if (playerCount === itemCount) {
      // add sample stock document
      const { gameId, week, day } = payload;
      const { nextWeek, nextDay } = this.calculateNextDay(week, day);

      await this.stocksService.createStock(gameId, nextWeek, nextDay);

      return { gameId, week: nextWeek, day: nextDay };
    }
  }

  @SubscribeMessage(DAY_START)
  async handDayStart(
    client: Socket,
    payload: DayStartRequestDto,
  ): Promise<DayStartResponseDto> {
    const { gameId, week, day } = payload;

    const dayChart: DayChart = await this.stocksService.findDayChart(
      gameId,
      week,
      day,
    );
    return { dayChart };
  }

  calculateNextDay(week: number, day: number) {
    return day === 5
      ? { nextWeek: week + 1, nextDay: 0 }
      : { nextWeek: week, nextDay: day + 1 };
  }
}
