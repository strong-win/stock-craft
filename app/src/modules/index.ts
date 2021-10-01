import { all } from "redux-saga/effects";
import { combineReducers } from "redux";

import { gameSlice } from "./game";
import { handleIO } from "./sockets";
import { stockSlice } from "./stock";

export const rootReducer = combineReducers({
  game: gameSlice.reducer,
  stock: stockSlice.reducer,
});

export function* rootSaga() {
  yield all([handleIO()]);
}
