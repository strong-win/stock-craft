import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PlayerStatus =
  | "connected"
  | "ready"
  | "play"
  | "finish"
  | "disconnected";

export type MessageState = {
  user: string;
  text: string;
  statuses: PlayerStatus[];
};

export type PlayerState = {
  name: string;
  status: PlayerStatus;
};

export type AssetState = {
  corpId: string;
  quantity: number;
};

export type TradeState = {
  _id: string;
  corpId: string;
  price: number;
  quantity: number;
  deal: string;
  status: "pending" | "disposed" | "cancel";
};

export type userState = {
  name: string;
  room: string;
  status: PlayerStatus;
  isHost: boolean;
  playerId: string;
  gameId: string;
  messages: MessageState[];
  players: PlayerState[];
  cash: number;
  assets: AssetState[];
  trades: TradeState[];
  selectedCorpId: string;
};

const initialState: userState = {
  name: "",
  room: "",
  status: "connected",
  isHost: false,
  playerId: "",
  gameId: "",
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
    updateStatus(state, action: PayloadAction<PlayerStatus>) {
      state.status = action.payload;
    },
    updateIsHost(state, action: PayloadAction<boolean>) {
      state.isHost = action.payload;
    },
    updatePlayerId(state, action: PayloadAction<string>) {
      state.playerId = action.payload;
    },
    updateGameId(state, action: PayloadAction<string>) {
      state.gameId = action.payload;
    },
    updatePlayers: (state, action: PayloadAction<PlayerState[]>) => {
      state.players = action.payload;
    },
    updateMessage: (state, action: PayloadAction<MessageState>) => {
      if (action.payload.statuses.includes(state.status)) {
        state.messages = [...state.messages, action.payload];
      }
    },
    updateAssets: (state, action: PayloadAction<AssetState[]>) => {
      state.assets = action.payload;
    },
    updateCash: (state, action: PayloadAction<number>) => {
      state.cash = action.payload;
    },
    updateSelectedCorpId: (state, action: PayloadAction<string>) => {
      state.selectedCorpId = action.payload;
    },
    updateTrades: (
      state,
      action: PayloadAction<{
        action: "request" | "refresh" | "cancel";
        trades: TradeState[];
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
  },
});

export const {
  updateName,
  updateRoom,
  updateStatus,
  updateIsHost,
  updatePlayerId,
  updateGameId,
  updateMessage,
  updatePlayers,
  updateAssets,
  updateCash,
  updateSelectedCorpId,
  updateTrades,
} = gameSlice.actions;

export default gameSlice.reducer;
