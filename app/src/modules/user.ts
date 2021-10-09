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
};

export type tradeType = {
  _id: string;
  corpId: string;
  price: number;
  quantity: number;
  deal: string;
  status: "pending" | "disposed" | "cancel";
};

export type gameType = {
  name: string;
  room: string;
  messages: messageType[];
  players: playerType[];
  cash: number;
  assets: assetType[];
  trades: tradeType[];
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
    // { corpId: "gyu", quantity: 0 },
    // { corpId: "kang", quantity: 0 },
    // { corpId: "han", quantity: 0 },
    // { corpId: "lee", quantity: 0 },
  ],
  trades: [
    // { _id, corpId: "gyu", price: 0, quantity: 0, deal: "buy", status: "pending" }
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
    updateTrades: (
      state,
      action: PayloadAction<{
        action: "request" | "refresh" | "cancel";
        trades: tradeType[];
      }>
    ) => {
      switch (action.payload.action) {
        case "request":
          state.trades = [...state.trades, ...action.payload.trades];
          break;
        case "refresh":
        case "cancel":
          for (const trade of action.payload.trades) {
            const { _id, status } = trade;
            state.trades = state.trades.map((trade) =>
              trade._id === _id ? { ...trade, status } : trade
            );
          }
          break;
        default:
          break;
      }
    },
    initializeAssets: (
      state,
      action: PayloadAction<{ corpId: string; corpName: string }[]>
    ) => {
      for (const corp of action.payload) {
        const { corpId } = corp;
        state.assets.push({ corpId, quantity: 0 });
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
  updateTrades,
  initializeAssets,
} = gameSlice.actions;

export default gameSlice.reducer;
