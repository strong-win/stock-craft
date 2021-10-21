import { PlayerUpdateDto } from '../dto/player-update.dto';
import { PlayerCreateDto } from '../dto/player-create.dto';
import { Player, PlayerDocument, PlayerStatus } from '../schemas/player.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
  ) {}

  async create(playerCreateDto: PlayerCreateDto): Promise<Player> {
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
}
