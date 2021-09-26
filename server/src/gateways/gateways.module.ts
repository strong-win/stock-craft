import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { GraphGateway } from './graph.gateway';

@Module({
  providers: [ChatGateway, GraphGateway],
})
export class GatewaysModule {}
