import { Module } from '@nestjs/common';
import { ChattingGateway } from './chatting.gateway';
import { TradeGateway } from './trade.gateway';
import { ChartGateway } from './chart.gateway';
import { ServicesModule } from 'src/services/services.module';

@Module({
  imports: [ServicesModule],
  providers: [ChattingGateway, TradeGateway, ChartGateway],
})
export class GatewaysModule {}
