import { eventChannel } from "@redux-saga/core";
import { apply, call, put, take } from "@redux-saga/core/effects";
import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { assetType, updateAssets, updateCash } from "../user";
import {
  TRADE_CANCEL,
  TRADE_REFRESH,
  TRADE_REQUEST,
  TRADE_RESPONSE,
} from "./events";

type TradeRequestType = {
  room: string;
  week: number;
  day: number;
  tick: number;
  corpId: string;
  price: number;
  quantity: number;
  deal: string;
};

type TradeRefreshType = {
  room: string;
  week: number;
  day: number;
  tick: number;
};

type TradeResponseType = {
  cash: number;
  assets: assetType[];
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

export const emitTradeCancel = createAction(
  TRADE_CANCEL,
  (payload: { corpId: string }) => ({ payload })
);

export function* emitTradeCancelSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(emitTradeCancel.type);
    yield apply(socket, socket.emit, [TRADE_CANCEL, payload]);
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

const createTradeResponseChannel = (socket: Socket) => {
  return eventChannel<TradeResponseType>((emit) => {
    socket.on(TRADE_RESPONSE, (payload: TradeResponseType) => {
      emit(payload);
    });

    return () => {};
  });
};

export function* receieveTradeResponse(socket: Socket) {
  const channel: ReturnType<typeof createTradeResponseChannel> = yield call(
    createTradeResponseChannel,
    socket
  );
  while (true) {
    const payload: TradeResponseType = yield take(channel);
    yield put(updateAssets(payload.assets));
    yield put(updateCash(payload.cash));

    // To do
    // update player asset and cash
    // update trade container with lock
  }
}
