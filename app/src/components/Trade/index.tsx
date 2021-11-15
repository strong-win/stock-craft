import { useState } from "react";
import { Row, Card, Col } from "reactstrap";

import "../../styles/Trade.css";
import { billType } from "../../containers/TradeWrapper";
import { ChartState } from "../../modules/stock";
import { TradeState } from "../../modules/user";

import TradeBoard from "./TradeBoard";
import TradeButton from "./TradeButton";
import TradeInput from "./TradeInput";
import TradeTab from "./TradeTab";
import TradeList from "./TradeList";

type TradeProps = {
  trades: TradeState[];
  corps: ChartState[];
  selectedCorpId: string;
  stockBill: billType;
  tradeBill: billType;
  isChartView: boolean;
  setTradeBill: React.Dispatch<React.SetStateAction<billType>>;
  handleDeal: React.MouseEventHandler<HTMLButtonElement>;
  handleCancel: (_id: string, corpId: string) => void;
};

const Trade = ({
  trades,
  corps,
  selectedCorpId,
  stockBill,
  tradeBill,
  isChartView,
  setTradeBill,
  handleDeal,
  handleCancel,
}: TradeProps) => {
  const [tradeType, setTradeType] = useState<"sell" | "buy">("buy");

  const handleChangeType = (e) => {
    setTradeType(e.target.id);
  };

  return isChartView ? (
    <Row className="h-100">
      <Col>
        <TradeList
          trades={trades}
          corps={corps}
          selectedCorpId={selectedCorpId}
          handleCancel={handleCancel}
          isChartView={true}
        />
      </Col>
      <Col className="tradeCard">
        <TradeTab tradeType={tradeType} handleChangeType={handleChangeType} />
        <TradeInput tradeBill={tradeBill} setTradeBill={setTradeBill} />
        <TradeButton tradeType={tradeType} handleDeal={handleDeal} />
      </Col>
    </Row>
  ) : (
    <Row className="h-100">
      <TradeList
        trades={trades}
        corps={corps}
        selectedCorpId={selectedCorpId}
        handleCancel={handleCancel}
      />
    </Row>
  );
};

export default Trade;
