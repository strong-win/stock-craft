import { PlayerType } from "../modules/user";

type PlayersProps = {
  code: string;
  players: PlayerType[];
};

const Players = ({ code, players }: PlayersProps) => {
  return (
    <div>
      <h1>Player Container</h1>
      <h3>code: {code}</h3>

      {players.map(({ clientId, name }, index) => (
        <div key={index}>
          {clientId} {name}
        </div>
      ))}
    </div>
  );
};

export default Players;
