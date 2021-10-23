import { useSelector, useDispatch } from "react-redux";

import { RootState } from "..";
import ReadyButton from "../components/ReadyButton";
import {PlayerState} from "../modules/user";
import {
  sendJoinCancel,
  sendJoinReady,
  sendJoinStart,
} from "../modules/sockets/join";

const ReadyWrapper = () => {
  const dispatch = useDispatch();
  const { playerId, room, status, players, isHost } = useSelector(
    (state: RootState) => state.user
  );

  const onClickReady = () => {
    isHost
      ? dispatch(sendJoinStart({ playerId, room }))
      : dispatch(sendJoinReady({ playerId, room }));
  };

  const onClickCancel = (e: any) => {
    dispatch(sendJoinCancel({ playerId, room }));
  };

  return <ReadyButton players={players} isHost={isHost} status={status} onClickReady={onClickReady} onClickCancel={onClickCancel} />;
};

export default ReadyWrapper;
