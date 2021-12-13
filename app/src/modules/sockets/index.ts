import { all, call } from "@redux-saga/core/effects";
import { Socket } from "socket.io-client";

import connectSocket from "../../configs/socket";
import { receiveChattingSaga, sendChattingSaga } from "./chatting";
import { receiveErrorSaga } from "./error";
import {
  receiveDayScoreSaga,
  receiveGameTimeResponseSaga,
  receiveWeekScoreSaga,
  sendGameTimeRequestSaga,
} from "./game";
import {
  receiveItemRequestSaga,
  receiveItemResponseSaga,
  sendItemRequestSaga,
} from "./items";
import {
  receiveJoinConnectedSaga,
  receiveJoinHostSaga,
  receiveJoinPlayersSaga,
  receiveJoinPlaySaga,
  sendJoinCancelSaga,
  sendJoinConnectedSaga,
  sendJoinLeaveSaga,
  sendJoinReadySaga,
  sendJoinStartSaga,
} from "./join";
import { tradeCancelSaga, tradeRequestSaga, tradeResponseSaga } from "./trade";

export function* handleIO() {
  const socket: Socket = yield call(connectSocket);

  yield all([
    // join
    sendJoinConnectedSaga(socket),
    receiveJoinConnectedSaga(),
    receiveJoinPlayersSaga(socket),
    sendJoinReadySaga(socket),
    receiveJoinPlaySaga(socket),
    sendJoinStartSaga(socket),
    sendJoinCancelSaga(socket),
    receiveJoinHostSaga(socket),
    sendJoinLeaveSaga(socket),

    // chatting
    sendChattingSaga(socket),
    receiveChattingSaga(socket),

    // trade
    tradeRequestSaga(socket),
    tradeCancelSaga(socket),
    tradeResponseSaga(socket),

    // game
    sendGameTimeRequestSaga(socket),
    receiveGameTimeResponseSaga(socket),
    receiveDayScoreSaga(socket),
    receiveWeekScoreSaga(socket),

    // item
    sendItemRequestSaga(socket),
    receiveItemResponseSaga(socket),
    receiveItemRequestSaga(),

    // error
    receiveErrorSaga(socket),
  ]);
}
