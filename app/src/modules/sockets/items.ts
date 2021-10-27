import { ITEM_REQUEST } from "./events";
import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { apply, take } from "@redux-saga/core/effects";

export type ItemRequest = {
  gameId: string;
  playerId: string;
  week: number;
  day: number;
  item: string[];
};

export const sendItemRequest = createAction(
  ITEM_REQUEST,
  (payload: ItemRequest) => ({ payload })
);

export function* sendItemRequestSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(ITEM_REQUEST);
    yield apply(socket, socket.emit, [ITEM_REQUEST, payload]);
  }
}
