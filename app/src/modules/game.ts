import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// game state 는 각 유저간 고유한 state

export type playerType = {
  clientId: string;
  name: string;
};

export type messageType = {
  user: string;
  text: string;
};

export type assetType = {
  corpName: string;
  quantity: number;
  isLock: boolean;
};

export type gameType = {
  name: string;
  code: string;
  messages: messageType[];
  players: playerType[];
  cash: number;
  assets: assetType[];

  // selected corporation
  corpInd: number;
  corpAsset: assetType;
};

const initialState: gameType = {
  name: "",
  code: "",
  messages: [],
  players: [],
  cash: 0,
  assets: [],

  // selected coporation
  corpInd: 0,
  corpAsset: { corpName: "", quantity: 0, isLock: true },
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    updateName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    updateCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
    },
    updatePlayers: (state, action: PayloadAction<playerType[]>) => {
      state.players = action.payload;
    },
    updateMessage: (state, action: PayloadAction<messageType>) => {
      state.messages = [...state.messages, action.payload];
    },
  },
});

export const { updateName, updateCode, updateMessage, updatePlayers } =
  gameSlice.actions;

export default gameSlice.reducer;
