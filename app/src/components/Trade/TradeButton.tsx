import { Col, Button } from "reactstrap";
import "../../styles/Trade.css";

type ButtonProps = {
  tradeType: "sell" | "buy";
  handleDeal: React.MouseEventHandler<HTMLButtonElement>;
};

const TradeButton = ({ tradeType, handleDeal }: ButtonProps) => {
  return (
    <Button
      className={`tradeButton ${tradeType}Button`}
      name={tradeType}
      onClick={handleDeal}
    >
      {tradeType === "sell" ? "매도" : "매수"}
    </Button>
  );
};

export default TradeButton;
