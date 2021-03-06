import { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";

import { billType } from "../../containers/TradeWrapper";
import { ChartState } from "../../modules/stock";
import { TradeState } from "../../modules/user";

import TradeButton from "./TradeButton";
import TradeInput from "./TradeInput";
import TradeTab from "./TradeTab";
import TradeList from "./TradeList";

import "../../styles/Trade.css";
import Ban from "../Ban";

type TradeProps = {
  trades: TradeState[];
  corps: ChartState[];
  selectedCorpId: string;
  stockBill: billType;
  tradeBill: billType;
  isChartView: boolean;
  disabled: boolean;
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
  disabled,
  isChartView,
  setTradeBill,
  handleDeal,
  handleCancel,
}: TradeProps) => {
  const [tradeType, setTradeType] = useState<"sell" | "buy">("buy");

  useEffect(() => {
    setTradeBill({ ...tradeBill, price: stockBill?.price });
  }, [stockBill]);

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
          isTitle={true}
        />
      </Col>
      <Col className="tradeCard">
        <Ban disabled={disabled} />
        <TradeTab tradeType={tradeType} handleChangeType={handleChangeType} />
        <TradeInput tradeBill={tradeBill} setTradeBill={setTradeBill} />
        <TradeButton
          tradeType={tradeType}
          handleDeal={handleDeal}
          disabled={disabled}
        />
      </Col>
    </Row>
  ) : (
    <Row className="h-100">
      <TradeList
        trades={trades}
        corps={corps}
        selectedCorpId={selectedCorpId}
        handleCancel={handleCancel}
        isTitle={true}
      />
    </Row>
  );
};

export default Trade;
