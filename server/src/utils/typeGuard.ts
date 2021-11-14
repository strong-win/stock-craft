import { Types } from 'mongoose';
import { Game } from 'src/schemas/game.schema';
import { Player } from 'src/schemas/player.schema';
import { Trade } from 'src/schemas/trade.schema';

export const isPlayer = (player: Types.ObjectId | Player): player is Player => {
  return (<Player>player)._id !== undefined;
};

export const isTrade = (trade: Types.ObjectId | Trade): trade is Trade => {
  return (<Trade>trade)._id !== undefined;
};

export const isGame = (game: Types.ObjectId | Game): game is Game => {
  return (<Game>game)._id !== undefined;
};
