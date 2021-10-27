import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import { updateIsHost, updateName, resetUser} from "../modules/user";
import Main from "../components/Main";
import { createName } from "../utils/create";

const MainWrapper = () => {
  // redux state
  const name = useSelector((state: RootState) => state.user.name);
  const dispatch = useDispatch();

  // react state
  const [room, setRoom] = useState<string>("");

  useEffect(() => {
    dispatch(resetUser());
    dispatch(updateName(createName()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeName = (e: any) => {
    dispatch(updateName(e.target.value));
  };

  const onChangeRoom = (e: any) => {
    setRoom(e.target.value);
  };

  const onCreateRoom = (e: any) => {
    dispatch(updateIsHost(true));
  };

  return (
    <Main
      name={name}
      room={room}
      onChangeName={onChangeName}
      onChangeRoom={onChangeRoom}
      onCreateRoom={onCreateRoom}
    />
  );
};

export default MainWrapper;
