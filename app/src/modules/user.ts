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
  started: boolean;
};

const initialState: gameType = {
  name: "",
  room: "",
  messages: [],
  players: [],
  cash: 100_000,
  assets: [
    // { corpId: "gyu", quantity: 0, isLock: false },
    // { corpId: "kang", quantity: 0, isLock: false },
    // { corpId: "han", quantity: 0, isLock: false },
    // { corpId: "lee", quantity: 0, isLock: false },
  ],
  selectedCorpId: "gyu",
  started: false,
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
    updateAssets: (state, action: PayloadAction<assetType[]>) => {
      state.assets = action.payload;
    },
    updateCash: (state, action: PayloadAction<number>) => {
      state.cash = action.payload;
    },
    updateStarted: (state, action: PayloadAction<boolean>) => {
      state.started = action.payload;
    },
    updateSelectedCorpId: (state, action: PayloadAction<string>) => {
      state.selectedCorpId = action.payload;
    },
    initializeAssets: (
      state,
      action: PayloadAction<{ corpId: string; corpName: string }[]>
    ) => {
      for (const corp of action.payload) {
        const { corpId } = corp;
        state.assets.push({ corpId, quantity: 0, isLock: false });
      }
    },
  },
});

export const {
  updateName,
  updateRoom,
  updateMessage,
  updatePlayers,
  updateAssets,
  updateCash,
  updateStarted,
  updateSelectedCorpId,
  initializeAssets,
} = gameSlice.actions;

export default gameSlice.reducer;
