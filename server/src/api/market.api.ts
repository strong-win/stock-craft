import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
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

  async postModel(gameId: Types.ObjectId | string): Promise<Corp[]> {
    if (typeof gameId === 'string') {
      gameId = Types.ObjectId(gameId);
    }

    return lastValueFrom(
      this.httpService
        .post(`${this.MOCK_SERVER_URI}/model`, { gameId })
        .pipe(map((res) => res.data)),
    );
  }

  async putModel(chartRequestDto: ChartRequestDto): Promise<ChartResponseDto> {
    return lastValueFrom(
      this.httpService
        .put(`${this.MOCK_SERVER_URI}/model`, chartRequestDto)
        .pipe(map((res) => res.data)),
    );
  }
}
