import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Stock, StockDocument } from 'src/schemas/stock.schema';
import { StockEffectStateProvider } from 'src/states/stock.effect.state';
import {
  Asset,
  Cash,
  Player,
  PlayerDocument,
  PlayerOption,
  PlayerSkill,
} from 'src/schemas/player.schema';
import { PlayerEffectStateProvider } from 'src/states/player.effect.state';
import { Message } from 'src/dto/item-response.dto';
import { Corp, Game, GameDocument } from 'src/schemas/game.schema';
import { CorpResult } from 'src/dto/chart-response.dto';
import { instanceOfChartResponseDto } from 'src/utils/typeGuard';

export type EffectRequest = {
  type: string;
  gameId?: Types.ObjectId | string;
  playerId: Types.ObjectId | string;
  target: string;
  week?: number;
  day?: number;
  data?: any;
};

export type EffectHandlerParams = {
  gameId?: string;
  playerId: string;
  target: string;
  week?: number;
  day?: number;
  data?: any;
};

type EffectHandler = ({
  gameId,
  playerId,
  target,
  week,
  day,
  data,
}: EffectHandlerParams) => Promise<void>;

@Injectable()
export class EffectProvider {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    private playerEffectState: PlayerEffectStateProvider,
    private stockEffectState: StockEffectStateProvider,
  ) {}

  private effectHandler_salary: EffectHandler = async ({
    gameId,
    playerId,
    week,
    day,
  }) => {
    const player: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(playerId),
    });

    const increment = Math.floor(player.cash.totalCash * 0.05);
    const cash: Cash = player.cash;

    cash.totalCash += increment;
    cash.availableCash += increment;

    await this.playerModel.updateOne(
      { _id: Types.ObjectId(playerId) },
      { cash },
    );

    const message: Message = {
      user: '관리자',
      text: `월급날 아이템 사용으로 현금의 5% 인 ${increment} 원 증가하였습니다.`,
      statuses: ['play'],
    };

    this.playerEffectState.update({
      gameId,
      playerId: player._id,
      clientId: player.clientId,
      week,
      day,
      cash,
      messages: [message],
      moment: 'now',
    });
  };

  private effectHandler_dividend: EffectHandler = async ({
    gameId,
    playerId,
    week,
    day,
  }) => {
    const NUM_STOCKS = 4; // actual NUM_STOCKS = 5
    const LAST_TICK = 3;

    const player: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(playerId),
    });

    const stocks: Stock[] = await this.stockModel
      .find({ game: Types.ObjectId(gameId), week, day, tick: LAST_TICK })
      .exec();

    // if (stocks.length !== NUM_STOCKS) {
    //   const stockError = new Error('주가를 정상적으로 불러오지 못하였습니다.');
    //   stockError.name = 'stockException';
    //   throw stockError;
    // }

    if (stocks.length !== NUM_STOCKS) {
      const message: Message = {
        user: '관리자',
        text: `주가 정보를 불러오지 못하여 배당을 받을 수 없습니다.`,
        statuses: ['play'],
      };

      this.playerEffectState.update({
        gameId,
        playerId: playerId,
        clientId: player.clientId,
        week,
        day,
        messages: [message],
        moment: 'now',
      });
    } else {
      const prices: { [key: string]: number } = {};
      stocks.forEach((stock: Stock) => {
        prices[stock.corpId] = stock.price;
      });

      let purchaseAmount = 0;
      player.assets.forEach((asset: Asset) => {
        if (prices[asset.corpId])
          purchaseAmount += prices[asset.corpId] * asset.totalQuantity;
      });

      const increment = Math.floor(purchaseAmount * 0.05);
      const cash: Cash = player.cash;

      cash.totalCash += increment;
      cash.availableCash += increment;

      await this.playerModel.updateOne(
        { _id: Types.ObjectId(playerId) },
        { cash },
      );

      const message: Message = {
        user: '관리자',
        text: `배당금 아이템 사용으로 총 평가금액의 5% 인 ${increment} 원 증가하였습니다.`,
        statuses: ['play'],
      };

      this.playerEffectState.update({
        gameId,
        playerId: player._id,
        clientId: player.clientId,
        week,
        day,
        cash,
        messages: [message],
        moment: 'now',
      });
    }
  };

  private effectHandler_lotto: EffectHandler = async ({
    gameId,
    playerId,
    week,
    day,
  }) => {
    const player: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(playerId),
    });

    const cash: Cash = player.cash;

    /**
     * 1% 확률로 500,000원
     * 5% 확률로 100,000원 이상
     * 50% 확률로 50,000원 이상
     */
    const rand = Math.random();
    const increment =
      rand < 0.01
        ? 500_000
        : rand < 0.1
        ? 100_000
        : rand < 0.5
        ? 50_000
        : 10_000;

    cash.totalCash += increment;
    cash.availableCash += increment;

    await this.playerModel.updateOne(
      { _id: Types.ObjectId(playerId) },
      { cash },
    );

    const message: Message = {
      user: '관리자',
      text: `로또 아이템 사용으로 ${increment} 원 증가하였습니다.`,
      statuses: ['play'],
    };

    this.playerEffectState.update({
      gameId,
      playerId: player._id,
      clientId: player.clientId,
      week,
      day,
      cash,
      messages: [message],
      moment: 'now',
    });
  };

  private effectHandler_chatoff: EffectHandler = async ({
    gameId,
    target,
    week,
    day,
  }) => {
    const player: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(target),
    });

    const options: PlayerOption = { ...player.options, chatoff: true };

    await this.playerModel.updateOne(
      { _id: Types.ObjectId(target) },
      { options },
    );

    const message: Message = {
      user: '관리자',
      text: '채팅 금지 아이템 사용으로 1일 간 채팅이 금지됩니다.',
      statuses: ['play'],
    };

    this.playerEffectState.update({
      gameId,
      playerId: player._id,
      clientId: player.clientId,
      week,
      day,
      options,
      messages: [message],
      moment: 'now',
    });
  };

  private effectHandler_tradeoff: EffectHandler = async ({
    gameId,
    target,
    week,
    day,
  }) => {
    const player: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(target),
    });

    const options: PlayerOption = { ...player.options, tradeoff: true };

    await this.playerModel.updateOne(
      { _id: Types.ObjectId(target) },
      { options },
    );

    const message: Message = {
      user: '관리자',
      text: '거래 금지 아이템 사용으로 1일 간 거래가 금지됩니다.',
      statuses: ['play'],
    };

    this.playerEffectState.update({
      gameId,
      playerId: player._id,
      clientId: player.clientId,
      week,
      day,
      options,
      messages: [message],
      moment: 'now',
    });
  };

  private effectHandler_leverage: EffectHandler = async ({
    gameId,
    playerId,
    week,
    day,
  }) => {
    const player: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(playerId),
    });

    const skills: PlayerSkill = { ...player.skills, leverage: true };

    await this.playerModel.updateOne(
      { _id: Types.ObjectId(playerId) },
      { skills },
    );

    const message: Message = {
      user: '관리자',
      text: '레버리지 아이템 사용으로 1일 간 판매 대금이 2배가 됩니다.',
      statuses: ['play'],
    };

    this.playerEffectState.update({
      gameId,
      playerId: player._id,
      clientId: player.clientId,
      week,
      day,
      skills,
      messages: [message],
      moment: 'now',
    });
  };

  private effectHandler_blackout: EffectHandler = async ({
    gameId,
    playerId,
    week,
    day,
  }) => {
    const options: PlayerOption = {
      chatoff: true,
      tradeoff: true,
    };

    await this.playerModel.updateMany(
      {
        _id: { $ne: Types.ObjectId(playerId) },
        game: Types.ObjectId(gameId),
      },
      { options },
    );

    const players: Player[] = await this.playerModel
      .find({
        _id: { $ne: Types.ObjectId(playerId) },
        game: Types.ObjectId(gameId),
      })
      .exec();

    const message: Message = {
      user: '관리자',
      text: '블랙아웃 아이템 사용으로 1일간 채팅과 거래가 금지됩니다.',
      statuses: ['play'],
    };

    players.forEach((player: Player) => {
      this.playerEffectState.update({
        gameId,
        playerId: player._id,
        clientId: player.clientId,
        week,
        day,
        options,
        messages: [message],
        moment: 'now',
      });
    });
  };

  private effectHandler_cloaking: EffectHandler = async ({
    gameId,
    playerId,
    target,
    week,
    day,
  }) => {
    const targetPlayer: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(target),
    });

    const player: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(playerId),
    });

    const skills = player.skills;
    skills.cloaking = targetPlayer._id.toString();

    await this.playerModel.updateMany(
      { _id: Types.ObjectId(playerId) },
      { skills },
    );

    const message: Message = {
      user: '관리자',
      text: `사칭 아이템 사용으로 1일간 ${targetPlayer.name}(으)로 이름이 변경됩니다.`,
      statuses: ['play'],
    };

    this.playerEffectState.update({
      gameId,
      playerId: player._id,
      clientId: player.clientId,
      week,
      day,
      skills,
      messages: [message],
      moment: 'now',
    });
  };

  private effectHandler_short: EffectHandler = async ({
    gameId,
    target,
    week,
    day,
  }) => {
    const stock: Stock = await this.stockModel
      .find({ gameId: Types.ObjectId(gameId), corpId: target })
      .sort({ week: -1, day: -1, tick: -1 })
      .limit(1)[0];

    const increment = -stock.price * 0.1;

    this.stockEffectState.update(gameId, target, week, day, increment);
  };

  private effectHandler_long: EffectHandler = async ({
    gameId,
    target,
    week,
    day,
  }) => {
    const stock: Stock = await this.stockModel
      .find({ gameId: Types.ObjectId(gameId), corpId: target })
      .sort({ week: -1, day: -1, tick: -1 })
      .limit(1)[0];

    const increment = stock.price * 0.1;

    this.stockEffectState.update(gameId, target, week, day, increment);
  };

  private effectHandler_news: EffectHandler = async ({
    gameId,
    week,
    day,
    data,
  }) => {
    if (!instanceOfChartResponseDto(data)) {
      throw new Error('데이터 타입이 일치하지 않습니다.');
    }

    const NUM_STOCKS = 4; // actual NUM_STOCKS = 5
    const IND_STOCK = Math.floor(Math.random() * NUM_STOCKS);

    const game: Game = await this.gameModel
      .findOne({
        _id: Types.ObjectId(gameId),
      })
      .populate('players');

    const corp: Corp = game.corps[IND_STOCK];
    const corpResult: CorpResult = data.corps[corp.corpId];

    const message: Message = {
      user: '관리자',
      text: `뉴스 아이템 사용으로 ${corp.corpName} 종목이 곧 ${
        corpResult.info ? '상승' : '하락'
      }한다는 정보를 입수했습니다.`,
      statuses: ['play'],
    };

    game.players.forEach((player: Player) => {
      this.playerEffectState.update({
        gameId,
        playerId: player._id,
        clientId: player.clientId,
        week,
        day,
        messages: [message],
        moment: 'after-infer',
      });
    });
  };

  private effectHandler_leading: EffectHandler = async ({
    gameId,
    week,
    day,
    data,
  }) => {
    if (!instanceOfChartResponseDto(data)) {
      throw new Error('데이터 타입이 일치하지 않습니다.');
    }

    const game: Game = await this.gameModel.findOne({
      _id: Types.ObjectId(gameId),
    });

    const corp: Corp = game.corps.find((corp: Corp) => corp.target === true);
    const corpResult: CorpResult = data.corps[corp.corpId];

    const message: Message = {
      user: '관리자',
      text: `리딩방 아이템 사용으로 ${corp.corpName} 종목이 곧 ${
        corpResult.info ? '하락' : '상승'
      }한다는 정보를 입수했습니다`,
      statuses: ['play'],
    };

    game.players.forEach((player: Player) => {
      this.playerEffectState.update({
        gameId,
        playerId: player._id,
        clientId: player.clientId,
        week,
        day,
        messages: [message],
        moment: 'after-infer',
      });
    });
  };

  private effectHandler: { [key: string]: EffectHandler } = {
    salary: this.effectHandler_salary,
    dividend: this.effectHandler_dividend,
    lotto: this.effectHandler_lotto,
    chatoff: this.effectHandler_chatoff,
    tradeoff: this.effectHandler_tradeoff,
    leverage: this.effectHandler_leverage,
    blackout: this.effectHandler_blackout,
    cloaking: this.effectHandler_cloaking,
    short: this.effectHandler_short,
    long: this.effectHandler_long,
    news: this.effectHandler_news,
    leading: this.effectHandler_leading,
  };

  async handleEffect({
    type,
    gameId,
    playerId,
    target,
    week,
    day,
    data,
  }: EffectRequest): Promise<void> {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }
    if (typeof playerId !== 'string') {
      playerId = playerId.toString();
    }

    await this.effectHandler[type]({
      gameId,
      playerId,
      target,
      week,
      day,
      data,
    });
  }
}
