import { Types } from 'mongoose';

export type PlayerOption = {
  category: 'chatting' | 'trade' | 'chart' | 'cash' | 'asset' | 'stock';
  active: boolean;
};

export type PlayerState = {
  gameId: Types.ObjectId | string;
  playerId: Types.ObjectId | string;
  clientId: string;
  options: PlayerOption[];
};

export class PlayerStateProvider {
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
      options: [{ category: 'chatting', active: true }],
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
    effect: PlayerOption,
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
          player.options = player.options.map((option) =>
            effect.category === option.category ? effect : option,
          );
        }
      });
    } else {
      this.players.forEach((player) => {
        if (target === player.playerId) {
          player.options = player.options.map((option) =>
            effect.category === option.category ? effect : option,
          );
        }
      });
    }
  }
}
