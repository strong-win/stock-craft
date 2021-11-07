import * as express from 'express';
import sample from './sample';

const PORT = 8081;

const app: express.Application = express();

app.post('/start', (req: express.Request, res: express.Response) => {
  console.log(req.body);
  console.log(sample.corps);
  res.send(sample.corps);
});

app.post('/chart', (req: express.Request, res: express.Response) => {
  // TODO
});

app.listen(PORT, () => {
  console.log(
    `⚡️[mock server]: Mock Server is running at https://localhost:${PORT}`,
  );
});
