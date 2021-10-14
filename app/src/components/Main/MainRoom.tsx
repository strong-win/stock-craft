import { Link } from "react-router-dom";

import "../../styles/Main.css";

type MainRoomProps = {
  room: string;
  onChangeRoom: (e: any) => void;
};

const MainRoom = ({ room, onChangeRoom }: MainRoomProps) => {
  return (
    <div className="roomContainer">
      <div className="createOuterContainer">
        <div className="createInnerContainer">
          <h3>CREATE ROOM</h3>
          <Link
            to={`/play?room=${Math.random()
              .toString(36)
              .toUpperCase()
              .slice(2, 8)}`}
          >
            <button className="roomButton" type="submit">
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
