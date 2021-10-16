import { useEffect } from "react";
import { Row, Col, Label, Button } from "reactstrap";
import { billType } from "../../containers/TradeWrapper";

import "../../styles/Trade.css";

type BoardProps = {
  stockBill: billType;
  tradeBill: billType;
  setTradeBill: React.Dispatch<React.SetStateAction<billType>>;
};

const TradeBoard = ({ stockBill, tradeBill, setTradeBill }: BoardProps) => {
  const { price, quantity } = stockBill;

  useEffect(() => {
    setTradeBill({ price, quantity });
  }, [setTradeBill, price, quantity]);

  return (
    <Col className="TradeBoard">
      <Row>
        <Col>
          <Label for="price">현재가격</Label>
        </Col>
        <Col>
          <Button
            color="link"
            id="price"
            onClick={() => setTradeBill({ ...tradeBill, price })}
          >
            {price}
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Label for="quantity">보유수량</Label>
        </Col>
        <Col>
          <Button
            color="link"
            id="quantity"
            onClick={() => setTradeBill({ ...tradeBill, quantity })}
          >
            {quantity}
          </Button>
        </Col>
      </Row>
    </Col>
  );
};

export default TradeBoard;
