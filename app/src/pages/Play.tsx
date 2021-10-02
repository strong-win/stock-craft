import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";

import { RootState } from "..";
import ChartWrpper from "../containers/ChartWrapper";
import ChattingWrapper from "../containers/ChattingWrapper";
import PlayersWrapper from "../containers/PlayersWrapper";
import { emitJoin } from "../modules/sockets/chatting";
import { updateRoom, updateName } from "../modules/game";
import { createName } from "../utils/create";
import TradeWrapper from "../containers/TradeWrapper";

const Play = ({ location }: any) => {
  const { room: initRoom } = queryString.parse(location.search);

  const name = useSelector((state: RootState) => state.game.name);
  const room = useSelector((state: RootState) => state.game.room);
  const dispatch = useDispatch();

  useEffect(() => {
    const createdName = createName();
    dispatch(updateName(createdName));

    if (typeof initRoom === "string") {
      dispatch(updateRoom(initRoom));
      dispatch(emitJoin({ name: createdName, room: initRoom }));
    }
  }, [dispatch, initRoom]);

  return (
    <>
      <ChartWrpper />
      <ChattingWrapper name={name} />
      <PlayersWrapper room={room} />
      <TradeWrapper />
    </>
  );
};

export default Play;
