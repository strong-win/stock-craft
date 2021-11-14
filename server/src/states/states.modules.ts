import { Module } from '@nestjs/common';
import { GameStateProvider } from './game.state';
import { PlayerStateProvider } from './player.state';
import { CorpStateProvider } from './corp.state';

@Module({
  providers: [GameStateProvider, PlayerStateProvider, CorpStateProvider],
  exports: [GameStateProvider, PlayerStateProvider, CorpStateProvider],
})
export class StatesModule {}
