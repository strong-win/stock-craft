import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ItemRequestDto } from 'src/dto/item-request.dto';

import { Item, ItemDocument } from 'src/schemas/items.schema';
import { GamesService } from './games.service';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: mongoose.Model<ItemDocument>,
    private gamesService: GamesService,
  ) {}

  async create(
    itemRequestDto: ItemRequestDto,
  ): Promise<Item & Document & mongoose.Document<any, any, ItemDocument>> {
    const { playerId, gameId, week, day, item } = itemRequestDto;
    const time = this.gamesService.getTime(gameId);

    if (time.week !== week || time.day !== day) {
      const timeError = new Error('아이템 사용시간이 불일치합니다.');
      timeError.name = 'timeException';
      throw timeError;
    }

    return this.itemModel.create({ playerId, gameId, week, day, item });
  }

  findByGameIdAndTime(
    gameId: string,
    week: number,
    day: number,
  ): Promise<(Item & Document & mongoose.Document<any, any, ItemDocument>)[]> {
    return this.itemModel.find({ gameId, week, day }).exec();
  }
}
