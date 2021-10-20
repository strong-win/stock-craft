import { PlayerUpdateDto } from './../dto/player-update.dto';
import { PlayerCreateDto } from '../dto/player-create.dto';
import {
  Player,
  PlayerDocument,
  PlayerStatus,
} from '../schemas/players.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
  ) {}

  async create(
    playerCreateDto: PlayerCreateDto,
  ): Promise<Player & Document & Document<any, any, PlayerDocument>> {
    return this.playerModel.create(playerCreateDto);
  }

  async findByPlayerId(playerId: string): Promise<Player> {
    return this.playerModel.findOne({ _id: playerId });
  }

  async findByClientIdAndStatuses(
    clientId: string,
    statuses: PlayerStatus[],
  ): Promise<Player & Document & Document<any, any, PlayerDocument>> {
    return this.playerModel.findOne({ clientId, status: { $in: statuses } });
  }

  async findByRoomAndStatuses(
    room: string,
    statuses: PlayerStatus[],
  ): Promise<(Player & Document & Document<any, any, PlayerDocument>)[]> {
    return this.playerModel
      .find({ room, status: { $in: statuses } })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findByGameIdAndStatuses(
    gameId: string,
    statuses: PlayerStatus[],
  ): Promise<(Player & Document & Document<any, any, PlayerDocument>)[]> {
    return this.playerModel.find({ gameId, status: { $in: statuses } }).exec();
  }

  async updateByPlayerId(playerId: string, playerUpdateDto: PlayerUpdateDto) {
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
