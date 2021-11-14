import * as express from 'express';
import { MongoClient } from 'mongodb';
import { Types } from 'mongoose';
import logger from 'morgan';
import sample from './sample';

type TimeState = {
  week: number;
  day: number;
  tick: number;
};

export type CorpEvent = {
  increment: number;
  buyQuantity: number;
  sellQuantity: number;
};

export type CorpEvents = {
  [key: string]: CorpEvent;
};

type ChartRequestDto = {
  gameId: string;
  prevTime: TimeState;
  nextTime: TimeState;
  corps: CorpEvents;
};

type ChartResponseDto = {
  gameId: string;
  nextTime: TimeState;
};

const PORT = process.env.PORT || 8081;

const app: express.Application = express();

app.use(express.json());
app.use(logger('dev'));

app.post('/model', (req: express.Request, res: express.Response) => {
  res.json(sample.corps);
});

app.put('/model', (req: express.Request, res: express.Response) => {
  const { gameId, prevTime, nextTime, corps }: ChartRequestDto = req.body;

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
