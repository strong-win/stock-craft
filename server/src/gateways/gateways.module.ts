import { RepositoriesModule } from './../repositories/repositories.module';
import { Module } from '@nestjs/common';
import { ServicesModule } from 'src/services/services.module';
import { ChattingGateway } from './chatting.gateway';
import { TradeGateway } from './trade.gateway';
import { JoinGateway } from './join.gateway';
import { ConfigModule } from '@nestjs/config';
import { GameGateway } from './game.gateway';

@Module({
  imports: [ServicesModule, RepositoriesModule, ConfigModule],
  providers: [ChattingGateway, TradeGateway, JoinGateway, GameGateway],
})
export class GatewaysModule {}
