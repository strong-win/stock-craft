import { useSelector } from "react-redux";

import { RootState } from "..";
import Players from "../components/Players";
import { PlayerType } from "../modules/user";

type PlayersWrapperProps = {
  code: string;
};

const PlayersWrapper = ({ code }: PlayersWrapperProps) => {
  const players: PlayerType[] = useSelector(
    (state: RootState) => state.user.players
  );
  return <Players code={code} players={players} />;
};

export default PlayersWrapper;
