import { useSelector } from "react-redux";

import { RootState } from "..";
import Players from "../components/Players";
import { PlayerState } from "../modules/user";

type PlayersWrapperProps = {
  room: string;
};

const PlayersWrapper = ({ room }: PlayersWrapperProps) => {
  const players: PlayerState[] = useSelector(
    (state: RootState) => state.user.players
  );
  return <Players room={room} players={players} />;
};

export default PlayersWrapper;
