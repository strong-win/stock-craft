import { Link } from "react-router-dom";

import "../../styles/Main.css";

type MainRoomProps = {
  room: string;
  onChangeRoom: (e: any) => void;
  onCreateRoom: React.MouseEventHandler<HTMLButtonElement>;
};

const MainRoom = ({ room, onChangeRoom, onCreateRoom }: MainRoomProps) => {
  return (
    <div className="roomContainer">
      <div className="createOuterContainer">
        <div className="createInnerContainer">
          <h3>CREATE ROOM</h3>
          {/**
           * TODO : - 룸 코드 유효성 확인 과정 추가
           */}
          <Link
            to={`/play?room=${Math.random()
              .toString(36)
              .toUpperCase()
              .slice(2, 8)}`}
          >
            <button className="roomButton" type="submit" onClick={onCreateRoom}>
              방 생성하기
            </button>
          </Link>
        </div>
      </div>
      <div className="joinOuterContainer">
        <div className="joinInnerContainer">
          <h3>JOIN ROOM</h3>
          <input
            className="roomInput"
            placeholder="코드를 입력하세요"
            onChange={onChangeRoom}
          />
          {/**
           * TODO : - 룸 코드 존재 여부 추가
           */}
          <Link
            onClick={(e) => (!room ? e.preventDefault() : null)}
            to={`/play?room=${room}`}
          >
            <button className="roomButton" type="submit">
              방 참여하기
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainRoom;
