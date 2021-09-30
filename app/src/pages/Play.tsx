import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";
import { RootState } from "..";
import ChartWrpper from "../containers/ChartWrapper";
import ChattingWrapper from "../containers/ChattingWrapper";
import PlayersWrapper from "../containers/PlayersWrapper";
import { updateCode, updateName } from "../modules/user";
import { createName } from "../utils/userInfo";
import { join } from "../modules/sockets";

const Play = ({ location }: any) => {
  const { room } = queryString.parse(location.search);

  const name = useSelector((state: RootState) => state.user.name);
  const code = useSelector((state: RootState) => state.user.code);
  const dispatch = useDispatch();

  useEffect(() => {
    const createdName = createName();
    dispatch(updateName(createdName));

    if (typeof room === "string") {
      dispatch(updateCode(room));
      dispatch(join({ name: createdName, room }));
    }
  }, [dispatch, room]);

  return (
    <>
      <ChartWrpper />
      <ChattingWrapper name={name} />
      <PlayersWrapper code={code} />
    </>
  );
};

export default Play;
