import MainRoom from "./MainRoom";
import MainTitle from "./MainTItle";

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
  return (
    <div className="mainContainer">
      <div className="headerContainer">
        <div>header</div>
      </div>

      <MainTitle name={name} onChangeName={onChangeName} />
      <MainRoom
        room={room}
        onChangeRoom={onChangeRoom}
        onCreateRoom={onCreateRoom}
      />

      <div className="footerContainer">
        <div>header</div>
      </div>
    </div>
  );
};

export default Main;
