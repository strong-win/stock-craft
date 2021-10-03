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
  ticker: string;
  corpName: string;
  quantity: number;
  isLock: boolean;
};

export type gameType = {
  name: string;
  room: string;
  messages: messageType[];
  players: playerType[];
  cash: number;
  assets: assetType[];

  // selected corporation
  selectedCorpInd: number;
  selectedCorpAsset: assetType;
};

const initialState: gameType = {
  name: "",
  room: "",
  messages: [],
  players: [],
  cash: 100_000,
  assets: [],

  // selected coporation
  selectedCorpInd: 0,
  selectedCorpAsset: {
    ticker: "gyu",
    corpName: "규희전자",
    quantity: 0,
    isLock: false,
  },
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    updateName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    updateRoom(state, action: PayloadAction<string>) {
      state.room = action.payload;
    },
    updatePlayers: (state, action: PayloadAction<playerType[]>) => {
      state.players = action.payload;
    },
    updateMessage: (state, action: PayloadAction<messageType>) => {
      state.messages = [...state.messages, action.payload];
    },
  },
});

export const { updateName, updateRoom, updateMessage, updatePlayers } =
  gameSlice.actions;

export default gameSlice.reducer;
