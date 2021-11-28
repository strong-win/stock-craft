import { Row, Col, Label, Button } from "reactstrap";

import "../../styles/Trade.css";

type TradeTabProps = {
  tradeType: "sell" | "buy";
  handleChangeType: (e) => void;
};

const TradeTab = ({ tradeType, handleChangeType }: TradeTabProps) => {
  return (
    <Row className="tradeTab px-3">
      <Col
        className={`tabButton ${tradeType === "buy" && "selectedBuyTab"}`}
        id="buy"
        onClick={handleChangeType}
      >
        매수
      </Col>
      <Col
        className={`tabButton ${tradeType === "sell" && "selectedSellTab"}`}
        id="sell"
        onClick={handleChangeType}
      >
        매도
      </Col>
    </Row>
  );
};

export default TradeTab;
