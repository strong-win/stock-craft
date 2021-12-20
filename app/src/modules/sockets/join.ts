import { Role, updateCash, updateRole } from "./../user";
import { channel, eventChannel } from "@redux-saga/core";
import { apply, call, put, select, take } from "@redux-saga/core/effects";
import { createAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { CorpState, initChart } from "../stock";
import {
  AssetState,
  PlayerState,
  updateAssets,
  updatePlayerId,
  updatePlayers,
  updateGameId,
  updateIsHost,
  updateStatus,
  setItems,
} from "../user";
import {
  JOIN_CANCEL,
  JOIN_CONNECTED,
  JOIN_HOST,
  JOIN_LEAVE,
  JOIN_PLAY,
  JOIN_PLAYERS,
  JOIN_READY,
  JOIN_START,
} from "./events";
import { RootState } from "../..";
import { ROLE_TYPE } from "../../constants/role";

export type CorpResponse = {
  corpId: string;
  corpName: string;
  target: number;
  totalChart: number[];
};

type JoinConnectedRequest = {
  playerId: string;
  isHost: boolean;
};

export const sendJoinConnected = createAction(
  JOIN_CONNECTED,
  (payload: { name: string; room: string; isHost: boolean }) => ({ payload })
);

const receiveJoinConnectedChannel = channel<JoinConnectedRequest>();

export function* sendJoinConnectedSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(JOIN_CONNECTED);
    yield apply(socket, socket.emit, [
      JOIN_CONNECTED,
      payload,
      ({ playerId, isHost }) => {
        receiveJoinConnectedChannel.put({ playerId, isHost });
      },
    ]);
  }
}

export function* receiveJoinConnectedSaga() {
  while (true) {
    const { playerId, isHost } = yield take(receiveJoinConnectedChannel);
    yield put(updatePlayerId(playerId));
    yield put(updateStatus("connected"));
    yield put(updateIsHost(isHost));
  }
}

const receiveJoinPlayersChannel = (socket: Socket) => {
  return eventChannel<PlayerState[]>((emit) => {
    socket.on(JOIN_PLAYERS, (players: PlayerState[]) => {
      emit(players);
    });

    return () => {};
  });
};

export function* receiveJoinPlayersSaga(socket: Socket) {
  const channel: ReturnType<typeof receiveJoinPlayersChannel> = yield call(
    receiveJoinPlayersChannel,
    socket
  );
  while (true) {
    const payload: PlayerState[] = yield take(channel);
    yield put(updatePlayers(payload));

    let role: Role;
    const playerId = yield select((state: RootState) => state.user.playerId);

    payload.forEach((player: PlayerState) => {
      if (playerId === player.playerId) {
        role = player.role;
      }
    });

    if (role) {
      yield put(updateRole(role));
      yield put(setItems(role));
      const initialAsset = ROLE_TYPE[role]?.INITIAL_ASSET;
      yield put(
        updateCash({ totalCash: initialAsset, availableCash: initialAsset })
      );
    }
  }
}

export const sendJoinReady = createAction(
  JOIN_READY,
  (payload: { playerId: string; room: string }) => ({ payload })
);

export function* sendJoinReadySaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(JOIN_READY);
    yield apply(socket, socket.emit, [JOIN_READY, payload]);
    yield put(updateStatus("ready"));
  }
}

export const sendJoinStart = createAction(
  JOIN_START,
  (payload: { playerId: string; room: string }) => ({ payload })
);

export function* sendJoinStartSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(JOIN_START);
    yield apply(socket, socket.emit, [JOIN_START, payload]);
  }
}

export const sendJoinCancel = createAction(
  JOIN_CANCEL,
  (payload: { playerId: string; room: string }) => ({ payload })
);

export function* sendJoinCancelSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(JOIN_CANCEL);
    yield apply(socket, socket.emit, [JOIN_CANCEL, payload]);
    yield put(updateStatus("connected"));
  }
}

const receiveJoinPlayChannel = (socket: Socket) => {
  return eventChannel<CorpState[]>((emit) => {
    socket.on(JOIN_PLAY, (corps: CorpState[]) => {
      emit(corps);
    });

    return () => {};
  });
};

export function* receiveJoinPlaySaga(socket: Socket) {
  const channel: ReturnType<typeof receiveJoinPlayChannel> = yield call(
    receiveJoinPlayChannel,
    socket
  );
  while (true) {
    const payload: { gameId: string; corps: CorpResponse[] } = yield take(
      channel
    );

    const assets: AssetState[] = payload.corps.map(
      ({ corpId }: CorpResponse) => ({
        corpId,
        totalQuantity: 0,
        availableQuantity: 0,
        purchaseAmount: 0,
      })
    );

    yield put(updateGameId(payload.gameId));
    yield put(initChart(payload.corps));
    yield put(updateAssets(assets));
    yield put(updateStatus("play"));
  }
}

const receiveJoinHostChannel = (socket: Socket) => {
  return eventChannel<boolean>((emit) => {
    socket.on(JOIN_HOST, ({ isHost }: { isHost: boolean }) => {
      emit(isHost);
    });

    return () => {};
  });
};

export function* receiveJoinHostSaga(socket: Socket) {
  const channel: ReturnType<typeof receiveJoinHostChannel> = yield call(
    receiveJoinHostChannel,
    socket
  );
  while (true) {
    const payload: boolean = yield take(channel);
    yield put(updateIsHost(payload));
  }
}

export const sendJoinLeave = createAction(
  JOIN_LEAVE,
  (payload: { room: string }) => ({ payload })
);

export function* sendJoinLeaveSaga(socket: Socket) {
  while (true) {
    const { payload } = yield take(JOIN_LEAVE);
    yield apply(socket, socket.emit, [JOIN_LEAVE, payload]);
  }
}
