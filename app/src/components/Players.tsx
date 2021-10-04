import { playerType } from "../modules/user";

type PlayersProps = {
  room: string;
  players: playerType[];
};

const Players = ({ room, players }: PlayersProps) => {
  return (
    <div>
      <h1>Player Container</h1>
      <div>room: {room}</div>

      {players.map(({ clientId, name }, index) => (
        <div key={index}>
          {clientId} {name}
        </div>
      ))}
    </div>
  );
};

export default Players;
