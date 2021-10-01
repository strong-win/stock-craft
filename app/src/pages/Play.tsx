import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";

import { RootState } from "..";
import ChartWrpper from "../containers/ChartWrapper";
import ChattingWrapper from "../containers/ChattingWrapper";
import PlayersWrapper from "../containers/PlayersWrapper";
import { emitJoin } from "../modules/sockets/chatting";
import { updateCode, updateName } from "../modules/game";
import { createName } from "../utils/userInfo";
import TradeWrapper from "../containers/TradeWrapper";

const Play = ({ location }: any) => {
  const { room } = queryString.parse(location.search);

  const name = useSelector((state: RootState) => state.game.name);
  const code = useSelector((state: RootState) => state.game.code);
  const dispatch = useDispatch();

  useEffect(() => {
    const createdName = createName();
    dispatch(updateName(createdName));

    if (typeof room === "string") {
      dispatch(updateCode(room));
      dispatch(emitJoin({ name: createdName, room }));
    }
  }, [dispatch, room]);

  return (
    <>
      <ChartWrpper />
      <ChattingWrapper name={name} />
      <PlayersWrapper code={code} />
      <TradeWrapper />
    </>
  );
};

export default Play;
