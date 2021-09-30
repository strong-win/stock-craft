import { all } from "redux-saga/effects";
import { combineReducers } from "redux";

import { userSlice } from "./user";
import { handleIO } from "./sockets";

export const rootReducer = combineReducers({
  user: userSlice.reducer,
});

export function* rootSaga() {
  yield all([handleIO()]);
}
