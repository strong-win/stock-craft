import { Col, Button } from "reactstrap";
import "../../styles/Trade.css";

type ButtonProps = {
  handleDeal: React.MouseEventHandler<HTMLButtonElement>;
};

const TradeButton = ({ handleDeal }: ButtonProps) => {
  return (
    <Col className="buttonContainer">
      <Button name="buy" onClick={handleDeal}>
        매수
      </Button>
      <Button name="sell" onClick={handleDeal}>
        매도
      </Button>
    </Col>
  );
};

export default TradeButton;
