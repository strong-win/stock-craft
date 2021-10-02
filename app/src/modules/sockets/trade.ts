import { apply, take } from "@redux-saga/core/effects";
import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { TRADE_REFRESH, TRADE_REQUEST } from "./events";

type TradeRequestType = {
  room: string;
  week: number;
  day: number;
  tick: number;
  corpName: string;
  price: number;
  quantity: number;
  deal: string;
};

type TradeRefreshType = {
  room: string;
  weeek: number;
  day: number;
  tick: number;
};

export const emitTradeRequest = createAction(
  TRADE_REQUEST,
  (payload: TradeRequestType) => ({ payload })
);

export function* emitTradeRequestSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(emitTradeRequest.type);
    yield apply(socket, socket.emit, [TRADE_REQUEST, payload]);
  }
}

export const emitTradeRefresh = createAction(
  TRADE_REFRESH,
  (payload: TradeRefreshType) => ({ payload })
);

export function* emitTradeRefreshSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(emitTradeRefresh.type);
    yield apply(socket, socket.emit, [TRADE_REFRESH, payload]);
  }
}
