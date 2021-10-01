import { playerType } from "../modules/game";

type PlayersProps = {
  code: string;
  players: playerType[];
};

const Players = ({ code, players }: PlayersProps) => {
  return (
    <div>
      <h1>Player Container</h1>
      <div>code: {code}</div>

      {players.map(({ clientId, name }, index) => (
        <div key={index}>
          {clientId} {name}
        </div>
      ))}
    </div>
  );
};

export default Players;
