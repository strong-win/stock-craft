import { useSelector } from "react-redux";

import { RootState } from "..";
import ReadyButton from "../components/ReadyButton";
import { playerType } from "../modules/user";

const ReadyWrapper = () => {

const players: playerType[] = useSelector(
    (state: RootState) => state.user.players
  );

  return <ReadyButton players={players} />;
};

export default ReadyWrapper;
