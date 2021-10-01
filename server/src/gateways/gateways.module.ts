import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { GraphGateway } from './graph.gateway';
import { TradeGateway } from './trade.gateway';

@Module({
  providers: [ChatGateway, GraphGateway, TradeGateway],
})
export class GatewaysModule {}
