import { Module } from '@nestjs/common';
import { ServicesModule } from 'src/services/services.module';
import { ChattingGateway } from './chatting.gateway';
import { TradeGateway } from './trade.gateway';
import { JoinGateway } from './join.gateway';
import { ConfigModule } from '@nestjs/config';
import { GameGateway } from './game.gateway';
import { StatesModule } from 'src/states/states.modules';
import { ApiModule } from 'src/api/api.module';
import { ItemGateway } from './item.gateway';

@Module({
  imports: [ServicesModule, StatesModule, ConfigModule, ApiModule],
  providers: [
    ChattingGateway,
    TradeGateway,
    JoinGateway,
    GameGateway,
    ItemGateway,
  ],
})
export class GatewaysModule {}
