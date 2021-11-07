import { Module } from '@nestjs/common';
import { StatesModule } from 'src/states/states.modules';
import { EffectProvider } from './effect.provider';

@Module({
  imports: [StatesModule],
  providers: [EffectProvider],
  exports: [EffectProvider],
})
export class ProvidersModule {}
