import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { DayEndRequestDto } from 'src/dto/day-end.dto';

import { Item, ItemDocument } from 'src/schemas/items.schema';
import { Player, PlayerDocument } from 'src/schemas/players.schema';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: mongoose.Model<ItemDocument>,
    @InjectModel(Player.name)
    private playerModel: mongoose.Model<PlayerDocument>,
  ) {}

  async createItem(
    dayEndRequestDto: DayEndRequestDto,
  ): Promise<{ playerCount: number; itemCount: number }> {
    const { playerId, gameId, week, day, item } = dayEndRequestDto;
    await this.itemModel.create({ playerId, gameId, week, day, item });

    const playerCount: number = await this.playerModel.countDocuments({
      gameId,
      status: 'play',
    });

    const itemCount: number = await this.itemModel.countDocuments({
      gameId,
      week,
      day,
    });

    return { playerCount, itemCount };
  }
}
