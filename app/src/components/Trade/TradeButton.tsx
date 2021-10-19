import "../../styles/Trade.css";

type ButtonProps = {
  handleDeal: React.MouseEventHandler<HTMLButtonElement>;
};

const TradeButton = ({ handleDeal }: ButtonProps) => {
  return (
    <div className="buttonOuterContainer">
      <div className="buttonContainer">
        <button name="buy" onClick={handleDeal}>
          매수
        </button>
        <button name="sell" onClick={handleDeal}>
          매도
        </button>
      </div>
    </div>
  );
};

export default TradeButton;
