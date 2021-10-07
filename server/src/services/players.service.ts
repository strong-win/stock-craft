import { CreatePlayerDto } from '../dto/create-player.dto';
import { assetType, Player, PlayerDocument } from '../schemas/players.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const createdPlayer = new this.playerModel(createPlayerDto);
    return createdPlayer.save();
  }

  async findByClientId(clientId: string): Promise<Player> {
    return this.playerModel.findOne({ clientId });
  }

  async findByRoom(room: string): Promise<Player[]> {
    return this.playerModel.find({ room }).exec();
  }

  async updateAssetByClientId(clientIds: string[], assets: assetType[]) {
    return this.playerModel.updateMany(
      { clientId: { $in: clientIds } },
      { assets },
    );
  }

  async delete(clientId: string): Promise<void> {
    await this.playerModel.deleteOne({ clientId });
  }
}
