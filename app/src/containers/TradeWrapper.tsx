import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Trade from "../components/Trade";
import { emitTradeRequest } from "../modules/sockets/trade";

export type billType = {
  price: number;
  quantity: number;
};

const TradeWrapper = () => {
  const { code, corpAsset } = useSelector((state: RootState) => state.game);
  const { week, day, tick, corpStock } = useSelector(
    (state: RootState) => state.stock
  );

  const { corpName, quantity, isLock } = corpAsset;
  const stockBill = { price: corpStock.price, quantity };
  const dispatch = useDispatch();

  const [tradeBill, setTradeBill] = useState<billType>(stockBill);

  const handleDeal = (e: any) => {
    const deal = e.target.name;
    dispatch(
      emitTradeRequest({
        ...tradeBill,
        code,
        week,
        day,
        tick,
        corpName,
        deal,
      })
    );
  };

  return (
    <Trade
      isLock={isLock}
      stockBill={stockBill}
      tradeBill={tradeBill}
      setTradeBill={setTradeBill}
      handleDeal={handleDeal}
    />
  );
};

export default TradeWrapper;
