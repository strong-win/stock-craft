import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import { ChartRequestDto } from 'src/dto/chart-request.dto';
import { ChartResponseDto } from 'src/dto/chart-response.dto';
import { Corp } from 'src/schemas/game.schema';

@Injectable()
export class MarketApi {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private MOCK_SERVER_URI = this.configService.get<string>('MOCK_SERVER_URI');

  async requestStart(gameId: string): Promise<Corp[]> {
    return lastValueFrom(
      this.httpService
        .post(`${this.MOCK_SERVER_URI}/start`, { gameId })
        .pipe(map((res) => res.data)),
    );
  }

  async requestChart(
    chartRequestDto: ChartRequestDto,
  ): Promise<ChartResponseDto> {
    return lastValueFrom(
      this.httpService
        .post(`${this.MOCK_SERVER_URI}/chart`, chartRequestDto)
        .pipe(map((res) => res.data)),
    );
  }
}
