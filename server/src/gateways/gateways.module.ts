import { Module } from '@nestjs/common';
import { ServicesModule } from 'src/services/services.module';
import { ChattingGateway } from './chatting.gateway';
import { TradeGateway } from './trade.gateway';
import { ChartGateway } from './chart.gateway';
import { JoinGateway } from './join.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ServicesModule, ConfigModule],
  providers: [ChattingGateway, TradeGateway, ChartGateway, JoinGateway],
})
export class GatewaysModule {}
