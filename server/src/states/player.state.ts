import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { PlayerOption } from 'src/dto/item-response.dto';
import { PlayerEffectStateProvider } from './player.effect.state';

export type PlayerState = {
  gameId: Types.ObjectId | string;
  playerId: Types.ObjectId | string;
  clientId: string;
  options: PlayerOption;
};

@Injectable()
export class PlayerStateProvider {
  constructor(private playerEffectState: PlayerEffectStateProvider) {}

  private players: PlayerState[] = [];

  create(
    gameId: Types.ObjectId | string,
    playerId: Types.ObjectId | string,
    clientId: string,
  ): void {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }
    if (typeof playerId !== 'string') {
      playerId = playerId.toString();
    }

    this.players.push({
      gameId,
      playerId,
      clientId,
      options: {
        chatting: true,
        trade: true,
        chart: true,
        cash: true,
        asset: true,
      },
    });
  }

  findByGameId(gameId: Types.ObjectId | string): PlayerState[] {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    return this.players.filter((player) => gameId === player.gameId);
  }

  async updateWithEffect(
    playerId: Types.ObjectId | string,
    target: string,
    week: number,
    day: number,
    options: PlayerOption,
  ): Promise<void> {
    if (typeof playerId !== 'string') {
      playerId = playerId.toString();
    }

    if (target === 'all') {
      // if target for all
      const gameId = <string>(
        this.players.find((player) => playerId === player.playerId).gameId
      );

      this.players.forEach((player) => {
        if (gameId === player.gameId && playerId !== player.playerId) {
          for (const key of Object.keys(options)) {
            player.options[key] = false;
          }

          this.playerEffectState.updateOrCreate({
            gameId: player.gameId,
            playerId: player.playerId,
            clientId: player.clientId,
            week,
            day,
            options,
            moment: 'now',
          });
        }
      });
    } else {
      this.players.forEach((player) => {
        if (target === player.playerId) {
          for (const key of Object.keys(options)) {
            player.options[key] = false;
          }

          this.playerEffectState.updateOrCreate({
            gameId: player.gameId,
            playerId: player.playerId,
            clientId: player.clientId,
            week,
            day,
            options,
            moment: 'now',
          });
        }
      });
    }
  }
}
