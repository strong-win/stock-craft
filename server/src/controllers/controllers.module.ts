import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';

@Module({
  controllers: [PlayersController],
})
export class ControllersModule {}
