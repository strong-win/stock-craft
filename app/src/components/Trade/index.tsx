import "../../styles/Trade.css";
import { billType } from "../../containers/TradeWrapper";

import TradeBoard from "./TradeBoard";
import TradeButton from "./TradeButton";
import TradeInput from "./TradeInput";

type TradeProps = {
  isLock: boolean;
  stockBill: billType;
  tradeBill: billType;
  setTradeBill: React.Dispatch<React.SetStateAction<billType>>;
  handleDeal: React.MouseEventHandler<HTMLButtonElement>;
  handleCancel: React.MouseEventHandler<HTMLButtonElement>;
  handleRefresh: React.MouseEventHandler<HTMLButtonElement>;
};

const Trade = ({
  isLock,
  stockBill,
  tradeBill,
  setTradeBill,
  handleDeal,
  handleCancel,
  handleRefresh,
}: TradeProps) => {
  return isLock ? (
    <>
      <h1>Input Container</h1>
      <button onClick={handleRefresh}>refresh</button>
      <div className="trade">
        <div>Locked</div>
        <button onClick={handleCancel}>cancel</button>
      </div>
    </>
  ) : (
    <>
      <h1>Input Container</h1>
      <button onClick={handleRefresh}>refresh</button>
      <div className="trade">
        <TradeBoard
          stockBill={stockBill}
          tradeBill={tradeBill}
          setTradeBill={setTradeBill}
        />
        <TradeInput tradeBill={tradeBill} setTradeBill={setTradeBill} />
        <TradeButton handleDeal={handleDeal} />
      </div>
    </>
  );
};

export default Trade;
