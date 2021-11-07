import * as express from 'express';
import { MongoClient } from 'mongodb';
import { Types } from 'mongoose';
import sample from './sample';

export type TimeState = {
  week: number;
  day: number;
  tick: number;
};

export type TradeVolume = {
  buyQuantity: number;
  sellQuantity: number;
};

export type ChartRequestDto = {
  gameId: string;
  prevTime: TimeState;
  nextTime: TimeState;
  itemTypes: string[];
  tradeVolume: TradeVolume;
};

export type ChartResponseDto = {
  gameId: string;
  nextTime: TimeState;
};

const PORT = process.env.PORT || 8081;

const app: express.Application = express();

app.use(express.json());

app.post('/start', (req: express.Request, res: express.Response) => {
  res.json(sample.corps);
});

app.post('/chart', (req: express.Request, res: express.Response) => {
  const {
    gameId,
    prevTime,
    nextTime,
    itemTypes,
    tradeVolume,
  }: ChartRequestDto = req.body;

  MongoClient.connect(
    'mongodb://mongodb:27017/stockcraft',
    (error, client): void => {
      if (error) {
        console.log(error);
      } else {
        const stocks = sample.stocks
          .filter(
            (stock) =>
              stock.week === nextTime.week && stock.day === nextTime.day,
          )
          .map((stock) => ({ ...stock, game: Types.ObjectId(gameId) }));

        const db = client.db('stockcraft');
        db.collection('stocks').insertMany(stocks);

        client.close();
      }
    },
  );

  const chartResponseDto: ChartResponseDto = {
    gameId,
    nextTime,
  };
  res.json(chartResponseDto);
});

app.listen(PORT, () => {
  console.log(
    `⚡️[mock server]: Mock Server is running at http://localhost:${PORT}`,
  );
});
