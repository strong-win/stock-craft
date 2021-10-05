import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";

import { RootState } from "..";
import ChattingWrapper from "../containers/ChattingWrapper";
import PlayersWrapper from "../containers/PlayersWrapper";
import TradeWrapper from "../containers/TradeWrapper";
import CorporationsWrapper from "../containers/CorporationsWrapper";
import { updateRoom, updateName } from "../modules/user";
import { emitJoin } from "../modules/sockets/chatting";
import { emitGameRequest } from "../modules/sockets/game";
import { createName } from "../utils/create";

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
      <CorporationsWrapper />
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
