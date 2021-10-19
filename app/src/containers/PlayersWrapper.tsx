import { useSelector } from "react-redux";

import { RootState } from "..";
import Players from "../components/Players";
import { playerType } from "../modules/user";

type PlayersWrapperProps = {
  room: string;
};

const PlayersWrapper = ({ room }: PlayersWrapperProps) => {
  const players: playerType[] = useSelector(
    (state: RootState) => state.user.players
  );

  return <Players players={players} />;
};

export default PlayersWrapper;
