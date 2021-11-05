import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ItemRequestDto } from 'src/dto/item-request.dto';

import { Item, ItemDocument } from 'src/schemas/item.schema';
import { GameService } from './game.service';

@Injectable()
export class ItemService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    private gameService: GameService,
  ) {}

  async create(itemRequestDto: ItemRequestDto): Promise<Item> {
    const { playerId, gameId, week, day, moment, category, type, target } =
      itemRequestDto;
    const time = this.gameService.getTime(gameId);

    if (
      time.week !== week ||
      time.day !== day ||
      (time.week == 0 && time.week > 4) ||
      (time.week > 0 && time.tick !== 4)
    ) {
      const timeError = new Error(
        '아이템 사용시간이 불일치하거나 사용 불가능한 시간입니다.',
      );
      timeError.name = 'timeException';
      throw timeError;
    }

    return this.itemModel.create({
      player: Types.ObjectId(playerId),
      game: Types.ObjectId(gameId),
      week,
      day,
      moment,
      category,
      type,
      target,
    });
  }

  findByGameIdAndTime(
    gameId: string,
    week: number,
    day: number,
  ): Promise<Item[]> {
    return this.itemModel
      .find({ game: Types.ObjectId(gameId), week, day })
      .exec();
  }
}
