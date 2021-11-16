import { Module } from '@nestjs/common';
import { PlayerEffectStateProvider } from './player.effect.state';
import { StockEffectStateProvider } from './stock.effect.state';
import { GameStateProvider } from './game.state';
import { PlayerStateProvider } from './player.state';

@Module({
  providers: [
    GameStateProvider,
    PlayerStateProvider,
    StockEffectStateProvider,
    PlayerEffectStateProvider,
  ],
  exports: [
    GameStateProvider,
    PlayerStateProvider,
    StockEffectStateProvider,
    PlayerEffectStateProvider,
  ],
})
export class StatesModule {}
