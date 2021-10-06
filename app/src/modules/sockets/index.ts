import { all, call } from "@redux-saga/core/effects";
import { Socket } from "socket.io-client";

import connectSocket from "../../configs/socket";

import { chartRequestSaga, chartResponseSaga } from "./chart";
import {
  chattingJoinSaga,
  chattingRequestSaga,
  chattingResponseSaga,
  playersResponseSaga,
} from "./chatting";
import { gameStartRequestSaga, gameStartResponseSaga } from "./game";
import {
  tradeCancelSaga,
  tradeRefreshSaga,
  tradeRequestSaga,
  tradeResponseSaga,
} from "./trade";

export function* handleIO() {
  const socket: Socket = yield call(connectSocket);

  yield all([
    // chatting
    chattingJoinSaga(socket),
    chattingRequestSaga(socket),
    chattingResponseSaga(socket),
    playersResponseSaga(socket),

    // trade
    tradeRequestSaga(socket),
    tradeCancelSaga(socket),
    tradeRefreshSaga(socket),
    tradeResponseSaga(socket),

    // chart
    chartRequestSaga(socket),
    chartResponseSaga(socket),

    // game
    gameStartRequestSaga(socket),
    gameStartResponseSaga(socket),
  ]);
}
