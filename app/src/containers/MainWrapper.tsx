import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import { updateIsHost, updateName } from "../modules/user";
import Main from "../components/Main";
import { createName } from "../utils/create";

const MainWrapper = () => {
  // redux state
  const name = useSelector((state: RootState) => state.user.name);
  const dispatch = useDispatch();

  // react state
  const [room, setRoom] = useState<string>("");
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

  useEffect(() => {
    dispatch(updateName(createName()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeName = (e: any) => {
    const name = e.target.value;
    const pattern = /^\S.{0,14}\S$/;
    dispatch(updateName(e.target.value));
    if (
      name.length > 16 ||
      name.length < 2 ||
      !pattern.test(name) ||
      name === "관리자"
    ) {
      setIsButtonDisabled(true);
    } else {
      setIsButtonDisabled(false);
    }
  };

  const onChangeRoom = (e: any) => {
    setRoom(e.target.value);
  };

  const onCreateRoom = (e: any) => {
    dispatch(updateIsHost(true));
  };

  const onEnterRoom = (e: any) => {
    if (!room) e.preventDefault();
    dispatch(updateIsHost(false));
  };

  return (
    <Main
      name={name}
      room={room}
      onChangeName={onChangeName}
      onChangeRoom={onChangeRoom}
      onCreateRoom={onCreateRoom}
      onEnterRoom={onEnterRoom}
      isButtonDisabled={isButtonDisabled}
    />
  );
};

export default MainWrapper;
