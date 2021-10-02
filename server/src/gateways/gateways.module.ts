import { Module } from '@nestjs/common';
import { ChattingGateway } from './chatting.gateway';
import { TradeGateway } from './trade.gateway';
import { ChartGateway } from './chart.gateway';

@Module({
  providers: [ChattingGateway, TradeGateway, ChartGateway],
})
export class GatewaysModule {}
