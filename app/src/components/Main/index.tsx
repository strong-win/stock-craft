import { HtmlHTMLAttributes, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";

import RoomCodeModal from "./RoomCodeModal";

type MainProps = {
  name: string;
  room: string;
  isButtonDisabled: boolean;
  onChangeName: (e: any) => void;
  onChangeRoom: (e: any) => void;
  onEnterRoom: React.MouseEventHandler<HTMLButtonElement>;
  onCreateRoom: React.MouseEventHandler<HTMLButtonElement>;
};

const Main = ({
  name,
  room,
  isButtonDisabled,
  onChangeName,
  onChangeRoom,
  onCreateRoom,
  onEnterRoom,
}: MainProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleModalOpen = () => {
    if (isButtonDisabled) {
      toast.error(
        "닉네임은 앞뒤 공백 없는 2~16 글자로 해야합니다. ('관리자' 사용 불가) "
      );
    } else {
      setIsModalOpen(!isModalOpen);
    }
  };
  return (
    <div className="mainContainer">
      <div className="mainTitle">
        <b>STOCK</b>CRAFT
      </div>
      <Input
        className="mainInput mx-auto"
        placeholder="2~16 글자 닉네임을 입력하세요"
        onChange={onChangeName}
        value={name}
      />
      <Link
        onClick={() => {
          if (isButtonDisabled) {
            toast.error(
              "닉네임은 앞뒤 공백 없는 2~16 글자로 해야합니다. ('관리자' 사용 불가) "
            );
          }
        }}
        to={
          isButtonDisabled
            ? ""
            : `/play?room=${Math.random()
                .toString(36)
                .toUpperCase()
                .slice(2, 8)}`
        }
      >
        <Button
          className="mainButton"
          onClick={onCreateRoom}
          disabled={isButtonDisabled}
        >
          방 만들기
        </Button>
      </Link>
      <Button className="mainButton" onClick={handleModalOpen}>
        방 참여하기
      </Button>
      <RoomCodeModal
        room={room}
        isOpen={isModalOpen}
        toggle={handleModalOpen}
        onChangeRoom={onChangeRoom}
        onEnterRoom={onEnterRoom}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Main;
