import { Row, Card } from "reactstrap";

import "../../styles/Trade.css";
import { billType } from "../../containers/TradeWrapper";
import { ChartState } from "../../modules/stock";
import { TradeState } from "../../modules/user";

import TradeBoard from "./TradeBoard";
import TradeButton from "./TradeButton";
import TradeInput from "./TradeInput";
import TradeList from "./TradeList";

type TradeProps = {
  trades: TradeState[];
  corps: ChartState[];
  selectedCorpId: string;
  stockBill: billType;
  tradeBill: billType;
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
  setTradeBill,
  handleDeal,
  handleCancel,
}: TradeProps) => {
  return (
    <>
      <Card className="tradeCard">
        <Row className="trade">
          <TradeBoard
            stockBill={stockBill}
            tradeBill={tradeBill}
            setTradeBill={setTradeBill}
          />
          <TradeInput tradeBill={tradeBill} setTradeBill={setTradeBill} />
          <TradeButton handleDeal={handleDeal} />
        </Row>
      </Card>
      <Row>
        <TradeList
          trades={trades}
          corps={corps}
          selectedCorpId={selectedCorpId}
          handleCancel={handleCancel}
        />
      </Row>
    </>
  );
};

export default Trade;
