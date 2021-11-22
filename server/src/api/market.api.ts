import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import { ChartRequestDto } from 'src/dto/chart-request.dto';
import { ChartResponseDto } from 'src/dto/chart-response.dto';
import { CorpChart } from 'src/services/join.service';

@Injectable()
export class MarketApi {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private MOCK_SERVER_URI = this.configService.get<string>('MOCK_SERVER_URI');

  async requestStart(gameId: string): Promise<CorpChart[]> {
    return lastValueFrom(
      this.httpService
        .post(`${this.MOCK_SERVER_URI}/model`, { gameId })
        .pipe(map((res) => res.data)),
    );
  }

  async requestChart(
    chartRequestDto: ChartRequestDto,
  ): Promise<ChartResponseDto> {
    return lastValueFrom(
      this.httpService
        .put(`${this.MOCK_SERVER_URI}/model`, chartRequestDto)
        .pipe(map((res) => res.data)),
    );
  }
}
