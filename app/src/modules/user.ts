import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";

import { ITEM_TYPE, ITEM } from "../constants/item";

export type Role = "" | "individual" | "institutional" | "party";

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
  playerId: string;
  name: string;
  status: PlayerStatus;
  role: Role;
  isHost: boolean;
};

export type AssetState = {
  corpId: string;
  totalQuantity: number;
  availableQuantity: number;
  purchaseAmount: number;
};

export type TradeState = {
  _id: string;
  corpId: string;
  price: number;
  quantity: number;
  deal: string;
  status: "pending" | "disposed" | "cancel";
};

export type CashState = {
  totalCash: number;
  availableCash: number;
};

export type PlayerOption = {
  chatoff?: boolean;
  tradeoff?: boolean;
};

export type PlayerSkill = {
  leverage?: boolean;
  cloaking?: string;
};

export type PlayerScore = {
  playerId: string;
  name: string;
  score: number;
};

export type UserState = {
  name: string;
  room: string;
  status: PlayerStatus;
  isHost: boolean;
  playerId: string;
  gameId: string;
  messages: MessageState[];
  players: PlayerState[];
  cash: CashState;
  assets: AssetState[];
  trades: TradeState[];
  selectedCorpId: string;
  isChartView: boolean;
  items: { [key: string]: number };
  options: PlayerOption;
  skills: PlayerSkill;
  scores: PlayerScore[];
  role: Role;
  errorMessage: string;
};

const initialState: UserState = {
  name: "",
  room: "",
  status: "connected",
  isHost: false,
  playerId: "",
  gameId: "",
  messages: [],
  players: [],
  items: {},
  cash: { totalCash: 100_000, availableCash: 100_000 },
  assets: [
    // { corpId: "gyu", totalQuantity: 0, availbleQuantity: 0, purchaseAmount: 0 },
    // { corpId: "kang", totalQuantity: 0, availbleQuantity: 0, purchaseAmount: 0 },
    // { corpId: "han", totalQuantity: 0, availbleQuantity: 0, purchaseAmount: 0 },
    // { corpId: "lee", totalQuantity: 0, availbleQuantity: 0, purchaseAmount: 0 },
  ],
  trades: [
    // { _id, corpId: "gyu", price: 0, quantity: 0, deal: "buy", status: "pending" }
  ],
  selectedCorpId: "",
  isChartView: false,
  options: {},
  skills: {},
  scores: [],
  role: "",
  errorMessage: "",
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    resetUser: () => initialState,
    clearPlayer(state) {
      const { name, isHost, room } = state;
      return {
        ...initialState,
        name,
        isHost,
        room,
      };
    },
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
    appendMessages: (state, action: PayloadAction<MessageState[]>) => {
      state.messages = [...state.messages, ...action.payload];
    },
    updateAssets: (state, action: PayloadAction<AssetState[]>) => {
      state.assets = action.payload;
    },
    updateCash: (state, action: PayloadAction<CashState>) => {
      state.cash = action.payload;
    },
    updateSelectedCorpId: (state, action: PayloadAction<string>) => {
      state.selectedCorpId = action.payload;
    },
    updateIsChartView: (state, action: PayloadAction<boolean>) => {
      state.isChartView = action.payload;
    },
    updateOptions: (state, action: PayloadAction<PlayerOption>) => {
      state.options = action.payload;
    },
    updateSkills: (state, action: PayloadAction<PlayerSkill>) => {
      state.skills = action.payload;
    },
    updateScores: (state, action: PayloadAction<PlayerScore[]>) => {
      state.scores = action.payload;
    },
    setItems: (state, action: PayloadAction<string>) => {
      //set items after role is decided
      const roleItems = ITEM_TYPE[action.payload];

      const randomCommonItems = _.sampleSize(ITEM_TYPE.common, 2);
      [...roleItems, ...randomCommonItems].forEach(
        (id) => (state.items[id] = 0)
      );
    },
    updateItemsBytime: (state) => {
      Object.keys(state.items).forEach((itemId) => {
        if (state.items[itemId] > 0) state.items[itemId] -= 1;
      });
    },
    updateItemCoolTime: (state, action: PayloadAction<string>) => {
      if (state.items[action.payload] !== undefined) {
        state.items[action.payload] = ITEM[action.payload]?.COOLTIME;
      }
    },
    updateRole: (state, action: PayloadAction<Role>) => {
      state.role = action.payload;
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
    updateErrorMessage: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
  },
});

export const {
  resetUser,
  updateName,
  updateRoom,
  updateStatus,
  updateIsHost,
  updatePlayerId,
  updateGameId,
  updateMessage,
  appendMessages,
  updatePlayers,
  updateAssets,
  updateCash,
  updateSelectedCorpId,
  updateIsChartView,
  updateOptions,
  updateSkills,
  updateScores,
  updateRole,
  updateTrades,
  updateItemsBytime,
  updateItemCoolTime,
  updateErrorMessage,
  setItems,
  clearPlayer,
} = gameSlice.actions;

export default gameSlice.reducer;
