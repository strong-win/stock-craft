import { all, call } from "@redux-saga/core/effects";
import { Socket } from "socket.io-client";

import connectSocket from "../../configs/socket";
import {
  receiveDayStartSaga,
  sendDayEndSaga,
  sendDayStartChannelSaga,
  sendDayStartSaga,
} from "./chart";

import { receiveChattingSaga, sendChattingSaga } from "./chatting";
import {
  receiveJoinConnectedSaga,
  receiveJoinPlayersSaga,
  receiveJoinPlaySaga,
  sendJoinConnectedSaga,
  sendJoinReadySaga,
} from "./join";
import {
  tradeCancelSaga,
  tradeRefreshSaga,
  tradeRequestSaga,
  tradeResponseSaga,
} from "./trade";

export function* handleIO() {
  const socket: Socket = yield call(connectSocket);

  yield all([
    // join
    sendJoinConnectedSaga(socket),
    receiveJoinConnectedSaga(),
    receiveJoinPlayersSaga(socket),
    sendJoinReadySaga(socket),
    receiveJoinPlaySaga(socket),

    // chatting
    sendChattingSaga(socket),
    receiveChattingSaga(socket),

    // day
    sendDayEndSaga(socket),
    sendDayStartSaga(socket),
    receiveDayStartSaga(),
    sendDayStartChannelSaga(),

    // trade
    tradeRequestSaga(socket),
    tradeCancelSaga(socket),
    tradeRefreshSaga(socket),
    tradeResponseSaga(socket),
  ]);
}
