import { Module } from '@nestjs/common';
import { PlayerEffectStateProvider } from './player.effect.state';
import { StockEffectStateProvider } from './stock.effect.state';
import { GameStateProvider } from './game.state';

@Module({
  providers: [
    GameStateProvider,
    StockEffectStateProvider,
    PlayerEffectStateProvider,
  ],
  exports: [
    GameStateProvider,
    StockEffectStateProvider,
    PlayerEffectStateProvider,
  ],
})
export class StatesModule {}
