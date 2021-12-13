import { ROLE_TYPE } from "../../constants/role";
import "../../styles/Corporations.css";
const ScoreBoard = ({ scores, isFinal, players, myId }) => {
  const sortedScores = [...scores];
  sortedScores.sort((a, b) => b.basic + b.bonus - (a.basic + a.bonus));
  const scoreItems = sortedScores.map(
    ({ basic, bonus, name, playerId }, index) => {
      return (
        <div className={`row ${playerId === myId ? "myRow" : ""}`}>
          <div className="col-1">{index + 1}위</div>
          <div className="col-1">
            {
              ROLE_TYPE[
                players.find((player) => player.playerId === playerId)?.role
              ].NAME
            }
          </div>
          {isFinal && (
            <>
              <div className="col-4">{name}</div>
            </>
          )}
          <div className="col-3">기본 {basic}점</div>
          <div className="col-3">보너스 {bonus}점</div>
        </div>
      );
    }
  );
  return <div className="ScoreBoard">{scoreItems}</div>;
};

export default ScoreBoard;
