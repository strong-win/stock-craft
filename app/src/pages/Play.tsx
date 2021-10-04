import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";

import { RootState } from "..";
import ChartWrpper from "../containers/ChartWrapper";
import ChattingWrapper from "../containers/ChattingWrapper";
import PlayersWrapper from "../containers/PlayersWrapper";
import { emitJoin } from "../modules/sockets/chatting";
import { updateRoom, updateName } from "../modules/user";
import { createName } from "../utils/create";
import TradeWrapper from "../containers/TradeWrapper";
import { emitGameRequest } from "../modules/sockets/game";

const Play = ({ location }: any) => {
  const { room: initRoom } = queryString.parse(location.search);

  const { name, room, started } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const createdName = createName();
    dispatch(updateName(createdName));

    if (typeof initRoom === "string") {
      dispatch(updateRoom(initRoom));
      dispatch(emitJoin({ name: createdName, room: initRoom }));
    }
  }, [dispatch, initRoom]);

  const onGameStart = (e: any) => {
    dispatch(emitGameRequest({ room }));
  };

  return started ? (
    <>
      <ChartWrpper />
      <ChattingWrapper name={name} />
      <PlayersWrapper room={room} />
      <TradeWrapper />
    </>
  ) : (
    <>
      <button onClick={onGameStart}>START</button>
    </>
  );
};

export default Play;
