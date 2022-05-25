import { ROLE_TYPE } from "../../constants/role";
import "../../styles/Corporations.css";
const ScoreBoard = ({ scores, isFinal, players, myId }) => {
  const sortedScores = [...scores];
  sortedScores.sort((a, b) => b.basic + b.bonus - (a.basic + a.bonus));
  const scoreItems = sortedScores.map(
    ({ basic, bonus, name, playerId }, index) => {
      return (
        <div className={`row ${playerId === myId ? "myRow" : ""}`}>
          <div className="col">{index + 1}위</div>
          <div className="col-2">
            {ROLE_TYPE[
              players.find(
                (player) =>
                  player.playerId === playerId && player.status === "play"
              )?.role
            ]?.NAME || "?"}
          </div>
          {isFinal && (
            <>
              <div className="col-3">{name}</div>
            </>
          )}
          <div className="col-3">{basic}점</div>
          <div className="col-3">{bonus}점</div>
        </div>
      );
    }
  );
  return (
    <div className="ScoreBoard">
      <div className="row">
        <div className="col">순위</div>
        <div className="col-2">역할</div>
        {isFinal && (
          <>
            <div className="col-3">이름</div>
          </>
        )}
        <div className="col-3">기본 점수</div>
        <div className="col-3">보너스 점수</div>
      </div>
      {scoreItems}
    </div>
  );
};

export default ScoreBoard;
