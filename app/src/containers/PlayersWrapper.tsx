import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "..";
import Players from "../components/Players";
import { PlayerType } from "../modules/user";

const PlayersWrapper = () => {
  const players: PlayerType[] = useSelector(
    (state: RootState) => state.user.players,
    shallowEqual
  );
  return <Players players={players} />;
};

export default PlayersWrapper;
