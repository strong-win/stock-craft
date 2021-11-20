import { Asset, Cash, PlayerOption } from 'src/schemas/player.schema';

export type Message = {
  user: string;
  text: string;
  statuses: string[];
};

export type ItemResponseDto = {
  clientId: string;
  options?: PlayerOption;
  cash?: Cash;
  asset?: Asset[];
  messages?: Message[];
};
