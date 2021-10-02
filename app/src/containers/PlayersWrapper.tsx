import { useSelector } from "react-redux";

import { RootState } from "..";
import Players from "../components/Players";
import { playerType } from "../modules/game";

type PlayersWrapperProps = {
  room: string;
};

const PlayersWrapper = ({ room }: PlayersWrapperProps) => {
  const players: playerType[] = useSelector(
    (state: RootState) => state.game.players
  );
  return <Players room={room} players={players} />;
};

export default PlayersWrapper;
