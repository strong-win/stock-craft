import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type StockDocument = Stock & Document;

interface DayStock {
  race: string;
  tick: number;
  price: number;
}

@Schema()
export class Stock {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Player' })
  roomId: string;

  @Prop()
  week: number;

  @Prop()
  days: DayStock[];
}

export const StockSchema = SchemaFactory.createForClass(Stock);

// 1 day

// room (code)
// week
// day
// ticker
// price : [100, 200, 300]

// week 0 에서 총 15 tick 을 미리 가져와서 대기
// week 0 은 주말 시작 시 미리 불러와서 렌더링
// 주중 시작 후 15초가 지나면 처음으로 생성된 주가 데이터 렌더링

// 주말에 1분동안 아이템 사용 가능한데 마지막 5초는 대기 시간 (55초간 사용 가능)
// 대기 시간 5초 사이에 game event 를 반영한 stock data 를 ML 에서 생성 후 백엔드에서 저장
// 5초가 지났을 때 주중 시작과 동시에 딱 1번 week 데이터를 가져와서 1week 동안 차트 갱신
