import "../../styles/Corporations.css";
const ScoreBoard = ({ scores }) => {
  const sortedScores = [...scores];
  sortedScores.sort((a, b) => b.score - a.score);
  const scoreItems = sortedScores.map((value, index) => {
    return (
      <div className="row">
        <div className="col">{index + 1}위</div>
        <div className="col">{value?.score}점</div>
      </div>
    );
  });
  return <div className="ScoreBoard">{scoreItems}</div>;
};

export default ScoreBoard;
