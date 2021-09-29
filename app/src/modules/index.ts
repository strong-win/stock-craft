import { Socket } from "socket.io-client";
import { all } from "redux-saga/effects";
import { userSlice } from "./user";
import { chattingSaga, userSaga } from "./sockets";
import { combineReducers } from "redux";
import socket from "../configs/socket";

export const rootReducer = combineReducers({
  user: userSlice.reducer,
});

export function* rootSaga() {
  yield all([socketSaga(socket)]);
}

export function* socketSaga(socket: Socket) {
  yield all([chattingSaga(socket), userSaga(socket)]);
}
