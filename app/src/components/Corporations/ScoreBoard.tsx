import { ROLE_TYPE } from "../../constants/role";
import "../../styles/Corporations.css";
const ScoreBoard = ({ scores, isFinal, players, myId }) => {
  const sortedScores = [...scores];
  sortedScores.sort((a, b) => b.score - a.score);
  const scoreItems = sortedScores.map(({ score, name, playerId }, index) => {
    return (
      <div className={`row ${playerId === myId ? "myRow" : ""}`}>
        <div className="col">{index + 1}위</div>
        {isFinal && (
          <>
            <div className="col">
              {
                ROLE_TYPE[
                  players.find((player) => player.playerId === playerId)?.role
                ].NAME
              }
            </div>
            <div className="col">{name}</div>
          </>
        )}
        <div className="col">{score}점</div>
      </div>
    );
  });
  return <div className="ScoreBoard">{scoreItems}</div>;
};

export default ScoreBoard;
