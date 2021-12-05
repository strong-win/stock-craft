import { PlayerUpdateDto } from '../dto/player-update.dto';
import { PlayerCreateDto } from '../dto/player-create.dto';
import {
  Player,
  PlayerDocument,
  PlayerOption,
  PlayerSkill,
  PlayerStatus,
} from '../schemas/player.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PlayerEffectStateProvider } from 'src/states/player.effect.state';
import { TimeState } from 'src/states/game.state';
import { isGame } from 'src/utils/typeGuard';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    private playerEffectState: PlayerEffectStateProvider,
  ) {}

  async create(playerCreateDto: PlayerCreateDto): Promise<Player> {
    return this.playerModel.create(playerCreateDto);
  }

  async findByPlayerId(playerId: string | Types.ObjectId): Promise<Player> {
    if (typeof playerId === 'string') {
      playerId = Types.ObjectId(playerId);
    }
    return this.playerModel.findOne({ _id: playerId });
  }

  async findByClientIdAndStatuses(
    clientId: string,
    statuses: PlayerStatus[],
  ): Promise<Player> {
    return this.playerModel.findOne({ clientId, status: { $in: statuses } });
  }

  async findByRoomAndStatuses(
    room: string,
    statuses: PlayerStatus[],
  ): Promise<Player[]> {
    return this.playerModel
      .find({ room, status: { $in: statuses } })
      .sort({ createdAt: 1 })
      .exec();
  }

  async updateByPlayerId(
    playerId: string | Types.ObjectId,
    playerUpdateDto: PlayerUpdateDto,
  ) {
    if (typeof playerId === 'string') {
      playerId = Types.ObjectId(playerId);
    }
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

  async initializeOptionsAndSkills(room: string, time: TimeState) {
    await this.playerModel.updateMany(
      { room, status: 'play' },
      {
        options: {
          chatoff: false,
          tradeoff: false,
        },
        skills: {
          leverage: false,
          cloaking: '',
        },
      },
    );

    const players: Player[] = await this.playerModel
      .find({ room, status: 'play' })
      .sort({ createdAt: 1 })
      .exec();

    const options: PlayerOption = {
      chatoff: false,
      tradeoff: false,
    };

    const skills: PlayerSkill = {
      leverage: false,
      cloaking: '',
    };

    players.forEach(({ _id: playerId, game, clientId }: Player) => {
      if (!isGame(game)) throw TypeError('타입이 일치하지 않습니다.');

      this.playerEffectState.create({
        playerId: playerId,
        gameId: game._id,
        clientId,
        week: time.week,
        day: time.day,
        options,
        skills,
        moment: 'now',
      });
    });
  }
}
