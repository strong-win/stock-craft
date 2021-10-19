import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { Item, ItemDocument } from 'src/schemas/items.schema';
import { Player, PlayerDocument } from 'src/schemas/players.schema';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: mongoose.Model<ItemDocument>,
    @InjectModel(Player.name)
    private playerModel: mongoose.Model<PlayerDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async createItem(
    clientId: string,
    room: string,
    week: number,
    day: number,
    item: string,
  ): Promise<{ playerCount: number; itemCount: number }> {
    // start transaction isolated
    const session = await this.connection.startSession();

    const playerCount: number = await this.playerModel.countDocuments({ room });
    const itemCountBefore: number = await this.itemModel.countDocuments({
      room,
      week,
      day,
    });

    await session.withTransaction(async () => {
      await this.itemModel.create({ clientId, room, week, day, item });
    });

    const itemCountAfter: number = await this.itemModel
      .countDocuments({ room, week, day })
      .session(session);

    if (itemCountBefore + 1 !== itemCountAfter) {
      const error = new Error('item 개수의 기대값이 다릅니다.');
      error.name = 'transactionError';
      throw Error;
    }

    session.endSession();

    return { playerCount, itemCount: itemCountAfter };
  }
}
