import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from 'src/schemas/games.schema';

@Injectable()
export class GamesService {
  constructor(@InjectModel(Game.name) private gameModel: Model<GameDocument>) {}

  async findCorpNames(
    room: string,
  ): Promise<{ corpId: string; corpName: string }[]> {
    const game = await this.gameModel.findOne({ room });
    return game.corps;
  }
}
