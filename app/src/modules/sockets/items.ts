import { ITEM_REQUEST, ITEM_RESPONSE } from "./events";
import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { apply, call, put, take } from "@redux-saga/core/effects";
import {
  AssetState,
  CashState,
  MessageState,
  PlayerOptionState,
  updateAssets,
  updateCash,
  updateItemCoolTime,
  updateMessage,
  updateOptions,
} from "../user";
import { channel, eventChannel } from "@redux-saga/core";

export type ItemRequest = {
  gameId: string;
  playerId: string;
  week: number;
  day: number;
  type: string;
  target: string;
};

export type ItemResponse = {
  clientId: string;
  options?: PlayerOptionState;
  cash?: CashState;
  assets?: AssetState[];
  messages?: MessageState;
};

export const sendItemRequest = createAction(
  ITEM_REQUEST,
  (payload: ItemRequest) => ({ payload })
);

const receiveItemRequestChannel = channel<string>();

export function* sendItemRequestSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(ITEM_REQUEST);
    yield apply(socket, socket.emit, [
      ITEM_REQUEST,
      payload,
      () => {
        receiveItemRequestChannel.put(payload.type);
      },
    ]);
  }
}

export function* receiveItemRequestSaga() {
  while (true) {
    const payload: string = yield take(receiveItemRequestChannel);
    yield put(updateItemCoolTime(payload));
  }
}

const receiveItemResponseChannel = (socket: Socket) => {
  return eventChannel<ItemResponse>((emit) => {
    socket.on(ITEM_RESPONSE, (payload: ItemResponse) => {
      emit(payload);
    });

    return () => {};
  });
};

export function* receiveItemResponseSaga(socket: Socket) {
  const channel: ReturnType<typeof receiveItemResponseChannel> = yield call(
    receiveItemResponseChannel,
    socket
  );

  while (true) {
    const payload: ItemResponse = yield take(channel);

    if (payload.options) yield put(updateOptions(payload.options));
    if (payload.cash) yield put(updateCash(payload.cash));
    if (payload.assets) yield put(updateAssets(payload.assets));
    if (payload.messages) yield put(updateMessage(payload.messages));
  }
}
