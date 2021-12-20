import { EffectProvider } from './../providers/effect.provider';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ItemRequestDto } from 'src/dto/item-request.dto';

import { Item, ItemDocument } from 'src/schemas/item.schema';
import { GameStateProvider } from 'src/states/game.state';
import { isPlayer } from 'src/utils/typeGuard';

@Injectable()
export class ItemService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    private gameState: GameStateProvider,
    private effectProvider: EffectProvider,
  ) {}

  async create(itemRequestDto: ItemRequestDto): Promise<Item> {
    const { playerId, gameId, week, day, type, target } = itemRequestDto;
    const time = this.gameState.getTime(gameId);

    if (
      time.week !== week ||
      time.day !== day ||
      time.week > 2 ||
      (time.day > 0 && time.tick !== 4)
    ) {
      const timeError = new Error(
        '아이템 사용시간이 불일치하거나 사용 불가능한 시간입니다.',
      );
      timeError.name = 'timeException';
      throw timeError;
    }

    const moment =
      type === 'chatoff'
        ? 'now'
        : type === 'tradeoff'
        ? 'now'
        : type === 'cloaking'
        ? 'now'
        : type === 'dividend'
        ? 'now'
        : type === 'lotto'
        ? 'now'
        : type === 'salary'
        ? 'now'
        : type === 'leverage'
        ? 'now'
        : type === 'blackout'
        ? 'now'
        : type === 'short'
        ? 'before-infer'
        : type === 'long'
        ? 'before-infer'
        : type === 'news'
        ? 'after-infer'
        : type === 'leading'
        ? 'after-infer'
        : null;

    if (type)
      return this.itemModel.create({
        player: Types.ObjectId(playerId),
        game: Types.ObjectId(gameId),
        week,
        day,
        type,
        target,
        moment,
      });
  }

  // chatting/trade/chart/cash/asset
  async useItems(
    gameId: string,
    week: number,
    day: number,
    moment: 'now' | 'before-infer' | 'after-infer',
    data?: any,
  ): Promise<void> {
    const items: Item[] = await this.itemModel
      .find({
        game: Types.ObjectId(gameId),
        week,
        day,
        moment,
      })
      .exec();

    for (const item of items) {
      if (!isPlayer(item.player)) throw TypeError('타입이 일치하지 않습니다.');

      await this.effectProvider.handleEffect({
        gameId,
        playerId: item.player._id,
        type: item.type,
        target: item.target,
        week,
        day,
        data,
      });
    }
  }
}
