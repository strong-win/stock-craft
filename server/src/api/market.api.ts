import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { ChartRequestDto } from 'src/dto/chart-request.dto';
import { ChartResponseDto } from 'src/dto/chart-response.dto';
import { Corp } from 'src/schemas/game.schema';

@Injectable()
export class MarketApi {
  constructor(private httpService: HttpService) {}

  async requestStart(gameId: string): Promise<Corp[]> {
    return lastValueFrom(
      this.httpService
        .post('http://mock:8081/start', { gameId })
        .pipe(map((res) => res.data)),
    );
  }

  async requestChart(
    chartRequestDto: ChartRequestDto,
  ): Promise<ChartResponseDto> {
    return lastValueFrom(
      this.httpService
        .post('http://mock:8081/chart', chartRequestDto)
        .pipe(map((res) => res.data)),
    );
  }
}
