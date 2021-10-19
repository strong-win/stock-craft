import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Game, GameDocument } from 'src/schemas/games.schema';
import { Player, PlayerDocument } from 'src/schemas/players.schema';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name) private gameModel: mongoose.Model<GameDocument>,
    @InjectModel(Player.name)
    private playerModel: mongoose.Model<PlayerDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async findCorpNames(
    room: string,
  ): Promise<{ corpId: string; corpName: string }[]> {
    const game = await this.gameModel.findOne({ room });
    return game.corps;
  }

  async addClients(
    clientId: string,
    room: string,
  ): Promise<{ playerCount: number; waitCount: number }> {
    const playerCount: number = await this.playerModel.countDocuments({ room });

    // start transaction isolated
    const session = await this.connection.startSession();

    const game = await this.gameModel.findOne({ room });
    const waits: string[] = [...game.waits, clientId];
    await this.gameModel.updateOne({ room }, { waits });

    session.endSession();

    return { playerCount, waitCount: waits.length };
  }

  async deleteClients(clientId: string, room: string): Promise<void> {
    const game = await this.gameModel.findOne({ room });
    const waits: string[] = game.waits.filter((wait) => wait !== clientId);
    await this.gameModel.updateOne({ room }, { waits });
  }
}
