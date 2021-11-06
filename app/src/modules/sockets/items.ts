import { ITEM_REQUEST, ITEM_RESPONSE } from "./events";
import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { apply, call, take } from "@redux-saga/core/effects";
import { eventChannel } from "@redux-saga/core";
import { updateUserOption } from "../user";

export type ItemRequest = {
  gameId: string;
  playerId: string;
  week: number;
  day: number;
  item: string[];
};

export type ItemResponse = {
  category: "chat" | "trade" | "chart" | "cash" | "asset" | "stock";
  active: boolean;
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

const createItemResponseChannel = (socket: Socket) => {
  return eventChannel<ItemResponse>((emit) => {
    socket.on(ITEM_RESPONSE, (payload: ItemResponse) => {
      emit(payload);
    });

    return () => {};
  });
};

export function* itemResponseSaga(socket: Socket) {
  const channel: ReturnType<typeof createItemResponseChannel> = yield call(
    createItemResponseChannel,
    socket
  );
  while (true) {
    const payload: ItemResponse = yield take(channel);

    if (payload.category === "chat") {
      updateUserOption(payload);
    }
  }
}
