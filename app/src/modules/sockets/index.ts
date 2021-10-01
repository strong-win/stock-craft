import { all, call } from "@redux-saga/core/effects";
import { Socket } from "socket.io-client";
import connectSocket from "../../configs/socket";
import {
  emitMessageSaga,
  emitJoinSaga,
  receieveMessage,
  receivePlayers,
} from "./chatting";
import { emitTradeRefreshSaga, emitTradeRequestSaga } from "./trade";

export function* handleIO() {
  const socket: Socket = yield call(connectSocket);

  yield all([
    receieveMessage(socket),
    receivePlayers(socket),
    emitJoinSaga(socket),
    emitMessageSaga(socket),
    emitTradeRequestSaga(socket),
    emitTradeRefreshSaga(socket),
  ]);
}
