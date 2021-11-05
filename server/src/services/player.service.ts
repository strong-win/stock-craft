import { PlayerUpdateDto } from '../dto/player-update.dto';
import { PlayerCreateDto } from '../dto/player-create.dto';
import { Player, PlayerDocument, PlayerStatus } from '../schemas/player.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

export type PlayerOption = {
  type: string;
  duration: number;
};

export type PlayerState = {
  playerId: string;
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
  createState(playerId: string) {
    this.players.push({
      playerId,
      option: [{ type: 'chat', duration: 0 }],
    });
  }

  async updateOptionByPlayerId(
    target: string,
    effect: PlayerOption,
  ): Promise<PlayerOption> {
    if (target === 'all') {
      // if target for all
      this.players.map((player) => ({
        ...player,
        option: player.option.map((option) =>
          effect.type === option.type ? effect : option,
        ),
      }));
    } else {
      // if target for the player
      this.players.map((player) =>
        target === player.playerId
          ? {
              ...player,
              option: player.option.map((option) =>
                effect.type === option.type ? effect : option,
              ),
            }
          : player,
      );
    }
    return effect;
  }
}
