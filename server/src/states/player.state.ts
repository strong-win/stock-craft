export type PlayerOption = {
  category: 'chatting' | 'trade' | 'chart' | 'cash' | 'asset' | 'stock';
  active: boolean;
};

export type PlayerState = {
  gameId: string;
  playerId: string;
  clientId: string;
  option: PlayerOption[];
};

export class PlayerStateProvider {
  private players: PlayerState[] = [];

  create(gameId: string, playerId: string, clientId: string): void {
    this.players.push({
      gameId,
      playerId,
      clientId,
      option: [{ category: 'chatting', active: true }],
    });
  }

  findByGameId(gameId: string): PlayerState[] {
    return this.players.filter((player) => gameId === player.gameId);
  }

  async updateWithEffect(
    playerId: string,
    target: string,
    effect: PlayerOption,
  ): Promise<void> {
    if (target === 'all') {
      // if target for all
      const gameId: string = this.players.find(
        (player) => playerId === player.playerId,
      ).gameId;

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
