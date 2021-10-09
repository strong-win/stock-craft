import "../../styles/Trade.css";
import { billType } from "../../containers/TradeWrapper";
import { chartType } from "../../modules/stock";
import { tradeType } from "../../modules/user";

import TradeBoard from "./TradeBoard";
import TradeButton from "./TradeButton";
import TradeInput from "./TradeInput";
import TradeList from "./TradeList";

type TradeProps = {
  trades: tradeType[];
  corps: chartType[];
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
      <h1>Input Container</h1>
      <div className="trade">
        <TradeBoard
          stockBill={stockBill}
          tradeBill={tradeBill}
          setTradeBill={setTradeBill}
        />
        <TradeInput tradeBill={tradeBill} setTradeBill={setTradeBill} />
        <TradeButton handleDeal={handleDeal} />
      </div>
      <div>
        <TradeList
          trades={trades}
          corps={corps}
          selectedCorpId={selectedCorpId}
          handleCancel={handleCancel}
        />
      </div>
    </>
  );
};

export default Trade;
