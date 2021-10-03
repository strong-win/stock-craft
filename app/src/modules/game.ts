import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type messageType = {
  user: string;
  text: string;
};

export type playerType = {
  clientId: string;
  name: string;
};

export type assetType = {
  corpId: string;
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
  selectedCorpId: string;
};

const initialState: gameType = {
  name: "",
  room: "",
  messages: [],
  players: [],
  cash: 100_000,
  assets: [
    { corpId: "gyu", quantity: 0, isLock: false },
    { corpId: "kang", quantity: 0, isLock: false },
    { corpId: "han", quantity: 0, isLock: false },
    { corpId: "lee", quantity: 0, isLock: false },
  ], // for test
  selectedCorpId: "gyu",
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
