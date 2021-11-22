import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input } from "reactstrap";

import RoomCodeModal from "./RoomCodeModal";

type MainProps = {
  name: string;
  room: string;
  onChangeName: (e: any) => void;
  onChangeRoom: (e: any) => void;
  onCreateRoom: React.MouseEventHandler<HTMLButtonElement>;
};

const Main = ({
  name,
  room,
  onChangeName,
  onChangeRoom,
  onCreateRoom,
}: MainProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleModalOpen = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <div className="mainContainer">
      <div className="mainTitle">
        <b>STOCK</b>CRAFT
      </div>
      <Input
        className="mainInput mx-auto"
        placeholder="닉네임을 입력하세요"
        onChange={onChangeName}
        value={name}
      />
      <Link
        to={`/play?room=${Math.random()
          .toString(36)
          .toUpperCase()
          .slice(2, 8)}`}
      >
        <Button className="mainButton" onClick={onCreateRoom}>
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
      />
    </div>
  );
};

export default Main;
