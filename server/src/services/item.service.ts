import { EffectProvider } from './../providers/effect.provider';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ItemRequestDto } from 'src/dto/item-request.dto';

import { Item, ItemDocument } from 'src/schemas/item.schema';
import { Player } from 'src/schemas/player.schema';
import { GameStateProvider } from 'src/states/game.state.';

@Injectable()
export class ItemService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    private gameState: GameStateProvider,
    private effectProvider: EffectProvider,
  ) {}

  async create(itemRequestDto: ItemRequestDto): Promise<Item> {
    const { playerId, gameId, week, day, moment, category, type, target } =
      itemRequestDto;
    const time = this.gameState.getTime(gameId);

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

  async findItems(
    gameId: string,
    week: number,
    day: number,
    moment: 'now' | 'on-infer' | 'after-infer' | 'end',
  ): Promise<Item[]> {
    return this.itemModel
      .find({ game: Types.ObjectId(gameId), week, day, moment })
      .exec();
  }

  async useItems(gameId: string, week: number, day: number): Promise<void> {
    const items: Item[] = await this.itemModel
      .find({
        game: Types.ObjectId(gameId),
        week,
        day,
        moment: 'now',
      })
      .exec();

    items.forEach((item) => {
      const isPlayer = (player: Types.ObjectId | Player): player is Player => {
        return (<Player>player)._id !== undefined;
      };

      if (!isPlayer(item.player)) {
        const typeGuardError = Error('타입이 일치하지 않습니다.');
        typeGuardError.name = 'TypeGuardError';
        throw typeGuardError;
      }

      this.effectProvider.handleEffect({
        playerId: item.player._id,
        type: item.type,
        target: item.target,
      });
    });
  }
}
