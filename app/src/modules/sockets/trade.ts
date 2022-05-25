import { eventChannel } from "@redux-saga/core";
import { apply, call, put, take } from "@redux-saga/core/effects";
import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";

import {
  AssetState,
  CashState,
  TradeState,
  updateAssets,
  updateCash,
  updateInfoMessages,
  updateTrades,
} from "../user";
import { TRADE_CANCEL, TRADE_REQUEST, TRADE_RESPONSE } from "./events";

type TradeRequest = {
  gameId: string;
  playerId: string;
  week: number;
  day: number;
  tick: number;
  corpId: string;
  price: number;
  quantity: number;
  deal: string;
};

type TradeCancel = {
  gameId: string;
  playerId: string;
  week: number;
  day: number;
  tick: number;
  corpId: string;
  _id: string;
};

type TradeResponse = {
  cash: CashState;
  assets: AssetState[];
  action: "request" | "refresh" | "cancel";
  trades: TradeState[];
};

export const tradeRequest = createAction(
  TRADE_REQUEST,
  (payload: TradeRequest) => ({ payload })
);

export function* tradeRequestSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(TRADE_REQUEST);
    yield apply(socket, socket.emit, [TRADE_REQUEST, payload]);
  }
}

export const tradeCancel = createAction(
  TRADE_CANCEL,
  (payload: TradeCancel) => ({ payload })
);

export function* tradeCancelSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(TRADE_CANCEL);
    yield apply(socket, socket.emit, [TRADE_CANCEL, payload]);
  }
}

const createTradeResponseChannel = (socket: Socket) => {
  return eventChannel<TradeResponse>((emit) => {
    socket.on(TRADE_RESPONSE, (payload: TradeResponse) => {
      emit(payload);
    });

    return () => {};
  });
};

export function* tradeResponseSaga(socket: Socket) {
  const channel: ReturnType<typeof createTradeResponseChannel> = yield call(
    createTradeResponseChannel,
    socket
  );
  while (true) {
    const payload: TradeResponse = yield take(channel);
    yield put(updateCash(payload.cash));
    yield put(updateAssets(payload.assets));
    yield put(updateTrades({ action: payload.action, trades: payload.trades }));
    yield put(updateInfoMessages(payload.trades));
  }
}
