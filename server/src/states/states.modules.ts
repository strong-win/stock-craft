import { Module } from '@nestjs/common';
import { GameStateProvider } from './game.state';
import { PlayerStateProvider } from './player.state';

@Module({
  providers: [GameStateProvider, PlayerStateProvider],
  exports: [GameStateProvider, PlayerStateProvider],
})
export class StatesModule {}
