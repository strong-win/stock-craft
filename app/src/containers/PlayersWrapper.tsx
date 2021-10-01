import { useSelector } from "react-redux";

import { RootState } from "..";
import Players from "../components/Players";
import { playerType } from "../modules/game";

type PlayersWrapperProps = {
  code: string;
};

const PlayersWrapper = ({ code }: PlayersWrapperProps) => {
  const players: playerType[] = useSelector(
    (state: RootState) => state.game.players
  );
  return <Players code={code} players={players} />;
};

export default PlayersWrapper;
