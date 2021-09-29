import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PlayerType = {
  clientId: string;
  name: string;
};

export type MessageType = {
  user: string;
  text: string;
};

export type UserType = {
  name: string;
  code: string;
  messages: MessageType[];
  players: PlayerType[];
};

const initialState: UserType = {
  name: "",
  code: "",
  messages: [],
  players: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    updatePlayers: (state, action: PayloadAction<PlayerType[]>) => {
      state.players = action.payload;
    },
    updateMessage: (state, action: PayloadAction<MessageType>) => {
      state.messages = [...state.messages, action.payload];
    },
  },
});

export const { updateName, updateMessage, updatePlayers } = userSlice.actions;

export default userSlice.reducer;
