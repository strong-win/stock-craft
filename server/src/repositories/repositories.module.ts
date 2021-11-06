import { Module } from '@nestjs/common';
import { GameRepository } from './game.repository';
import { PlayerRepository } from './player.repository';

@Module({
  providers: [GameRepository, PlayerRepository],
  exports: [GameRepository, PlayerRepository],
})
export class RepositoriesModule {}
