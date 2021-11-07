import { Types } from 'mongoose';

export type PlayerOption = {
  category: 'chatting' | 'trade' | 'chart' | 'cash' | 'asset' | 'stock';
  active: boolean;
};

export type PlayerState = {
  gameId: Types.ObjectId | string;
  playerId: Types.ObjectId | string;
  clientId: string;
  option: PlayerOption[];
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
      option: [{ category: 'chatting', active: true }],
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

      this.players.map((player) =>
        gameId === player.gameId && playerId !== player.playerId
          ? {
              ...player,
              option: player.option.map((option) =>
                effect.category === option.category ? effect : option,
              ),
            }
          : player,
      );
    } else {
      this.players.map((player) =>
        target === player.gameId
          ? {
              ...player,
              option: player.option.map((option) =>
                effect.category === option.category ? effect : option,
              ),
            }
          : player,
      );
    }
  }
}
