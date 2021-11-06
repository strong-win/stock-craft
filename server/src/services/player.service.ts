import { PlayerUpdateDto } from '../dto/player-update.dto';
import { PlayerCreateDto } from '../dto/player-create.dto';
import { Player, PlayerDocument, PlayerStatus } from '../schemas/player.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

export type PlayerOption = {
  category: 'chat' | 'trade' | 'chart' | 'cash' | 'asset' | 'stock';
  active: boolean;
};

export type PlayerState = {
  playerId: string;
  clientId: string;
  gameId: string;
  option: PlayerOption[];
};

@Injectable()
export class PlayerService {
  // state for handling options
  private players: PlayerState[] = [];

  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
  ) {}

  async createDocument(playerCreateDto: PlayerCreateDto): Promise<Player> {
    return this.playerModel.create(playerCreateDto);
  }

  async findByPlayerId(playerId: string | Types.ObjectId): Promise<Player> {
    if (typeof playerId === 'string') {
      playerId = Types.ObjectId(playerId);
    }
    return this.playerModel.findOne({ _id: playerId });
  }

  async findByClientIdAndStatuses(
    clientId: string,
    statuses: PlayerStatus[],
  ): Promise<Player> {
    return this.playerModel.findOne({ clientId, status: { $in: statuses } });
  }

  async findByRoomAndStatuses(
    room: string,
    statuses: PlayerStatus[],
  ): Promise<Player[]> {
    return this.playerModel
      .find({ room, status: { $in: statuses } })
      .sort({ createdAt: 1 })
      .exec();
  }

  async updateByPlayerId(
    playerId: string | Types.ObjectId,
    playerUpdateDto: PlayerUpdateDto,
  ) {
    if (typeof playerId === 'string') {
      playerId = Types.ObjectId(playerId);
    }
    return this.playerModel.updateOne({ _id: playerId }, playerUpdateDto);
  }

  async updateByRoomAndStatuses(
    room: string,
    statuses: PlayerStatus[],
    playerUpdateDto: PlayerUpdateDto,
  ) {
    return this.playerModel.updateMany(
      { room, status: { $in: statuses } },
      playerUpdateDto,
    );
  }

  // state
  // TODO - state 를 repository 로 별도로 분리
  createState(gameId: string, playerId: string, clientId: string): void {
    this.players.push({
      gameId,
      playerId,
      clientId,
      option: [{ category: 'chat', active: true }],
    });
  }

  findStateByGameId(gameId: string): PlayerState[] {
    return this.players.filter((player) => gameId === player.gameId);
  }

  async updateStateByPlayerId(
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
        gameId === player.gameId
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
