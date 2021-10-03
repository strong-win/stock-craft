import { all, call } from "@redux-saga/core/effects";
import { Socket } from "socket.io-client";
import connectSocket from "../../configs/socket";
import { emitChartSaga, receiveChart } from "./chart";
import {
  emitMessageSaga,
  emitJoinSaga,
  receieveMessage,
  receivePlayers,
} from "./chatting";
import {
  emitTradeRefreshSaga,
  emitTradeRequestSaga,
  receieveTradeResponse,
} from "./trade";

export function* handleIO() {
  const socket: Socket = yield call(connectSocket);

  yield all([
    // chatting
    receieveMessage(socket),
    receivePlayers(socket),
    emitJoinSaga(socket),
    emitMessageSaga(socket),

    // trade
    emitTradeRequestSaga(socket),
    emitTradeRefreshSaga(socket),
    receieveTradeResponse(socket),

    // chart
    emitChartSaga(socket),
    receiveChart(socket),
  ]);
}
