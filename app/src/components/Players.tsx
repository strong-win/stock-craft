import { PlayerType } from "../modules/user";

const Players = ({ players }: { players: PlayerType[] }) => {
  return (
    <div>
      <h1>Player Container</h1>

      {players.map(({ clientId, name }, index) => (
        <div key={index}>
          {clientId} {name}
        </div>
      ))}
    </div>
  );
};

export default Players;
