import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import { updateName } from "../modules/user";
import Main from "../components/Main";

const MainWrapper = () => {
  // redux state
  const name = useSelector((state: RootState) => state.user.name);
  const dispatch = useDispatch();

  // react state
  const [room, setRoom] = useState<string>("");

  const onChangeName = (e: any) => {
    dispatch(updateName(e.target.value));
  };

  const onChangeRoom = (e: any) => {
    setRoom(e.target.value);
  };

  return (
    <Main
      name={name}
      room={room}
      onChangeName={onChangeName}
      onChangeRoom={onChangeRoom}
    />
  );
};

export default MainWrapper;
