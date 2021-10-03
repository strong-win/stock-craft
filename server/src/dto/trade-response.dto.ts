import { PlayerDocument } from '../schemas/players.schema';

type tradeResultType = {
  ticker: string;
  corpName: string;
  price: number;
  quantity: number;
  deal: string;
  isLock: boolean;
};

export class TradeResponseDto {
  player: PlayerDocument;
  trade: tradeResultType;
}
