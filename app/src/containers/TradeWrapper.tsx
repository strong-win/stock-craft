import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Trade from "../components/Trade";
import { assetType } from "../modules/game";
import { emitTradeRequest } from "../modules/sockets/trade";
import { chartType } from "../modules/stock";

export type billType = {
  price: number;
  quantity: number;
};

const TradeWrapper = () => {
  // redux state
  const { room, assets, selectedCorpId } = useSelector(
    (state: RootState) => state.game
  );
  const { charts } = useSelector((state: RootState) => state.stock);
  const { week, day, tick } = useSelector((state: RootState) => state.time);

  // container state
  const [stockBill, setStockBill] = useState<billType>({
    price: 0,
    quantity: 0,
  });
  const [tradeBill, setTradeBill] = useState<billType>({
    price: 0,
    quantity: 0,
  });
  const [isLock, setIsLock] = useState(false);

  useEffect(() => {
    const corpStock: chartType = charts.filter(
      (chart) => chart.corpId === selectedCorpId
    )[0];
    const corpAsset: assetType = assets.filter(
      (asset) => asset.corpId === selectedCorpId
    )[0];

    const { quantity, isLock } = corpAsset;
    const stockBill = { price: corpStock.todayChart[tick - 1] || 0, quantity };
    setIsLock(isLock);
    setStockBill(stockBill);
  }, [assets, selectedCorpId, charts, tick]);

  const dispatch = useDispatch();

  const handleDeal = (e: any) => {
    const deal = e.target.name;
    dispatch(
      emitTradeRequest({
        ...tradeBill,
        room,
        week,
        day,
        tick,
        corpId: selectedCorpId,
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
