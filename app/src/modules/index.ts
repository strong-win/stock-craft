import { all } from "redux-saga/effects";
import { combineReducers } from "redux";

import { gameSlice } from "./user";
import { handleIO } from "./sockets";
import { stockSlice } from "./stock";
import { timeSlice } from "./time";

export const rootReducer = combineReducers({
  user: gameSlice.reducer,
  stock: stockSlice.reducer,
  time: timeSlice.reducer,
});

export function* rootSaga() {
  yield all([handleIO()]);
}
