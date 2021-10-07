import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Trade from "../components/Trade";
import { assetType } from "../modules/user";
import { tradeCancel, tradeRequest } from "../modules/sockets/trade";
import { chartType } from "../modules/stock";

export type billType = {
  price: number;
  quantity: number;
};

const TradeWrapper = () => {
  // redux state
  const { room, assets, selectedCorpId } = useSelector(
    (state: RootState) => state.user
  );
  const { corps } = useSelector((state: RootState) => state.stock);
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
    const corpStock: chartType = corps.find(
      (chart) => chart.corpId === selectedCorpId
    );
    const corpAsset: assetType = assets.find(
      (asset) => asset.corpId === selectedCorpId
    );

    const { quantity, isLock } = corpAsset;
    const stockBill = {
      price: corpStock.todayChart[tick * 4 - 1] || 0,
      // price: corpStock.todayChart[tick - 1] || 0,
      quantity,
    };

    setIsLock(isLock);
    setStockBill(stockBill);
  }, [assets, selectedCorpId, corps, tick]);

  const dispatch = useDispatch();

  const handleDeal = (e: any) => {
    const deal = e.target.name;
    dispatch(
      tradeRequest({
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

  const handleCancel = (e: any) => {
    dispatch(tradeCancel({ corpId: selectedCorpId }));
  };

  return (
    <Trade
      isLock={isLock}
      stockBill={stockBill}
      tradeBill={tradeBill}
      setTradeBill={setTradeBill}
      handleDeal={handleDeal}
      handleCancel={handleCancel}
    />
  );
};

export default TradeWrapper;
