import { Asset, Cash } from 'src/schemas/player.schema';

export type Message = {
  user: string;
  text: string;
  statuses: string[];
};

export type PlayerOption = {
  chatting?: boolean;
  trade?: boolean;
  chart?: boolean;
  cash?: boolean;
  asset?: boolean;
};

export type ItemResponseDto = {
  clientId: string;
  options?: PlayerOption;
  cash?: Cash;
  asset?: Asset[];
  messages?: Message[];
};
