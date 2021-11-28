import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Trade from "../components/Trade";
import { AssetState } from "../modules/user";
import { tradeCancel, tradeRequest } from "../modules/sockets/trade";
import { ChartState } from "../modules/stock";

export type billType = {
  price: number;
  quantity: number;
};

const TradeWrapper = () => {
  // redux state
  const { gameId, playerId, assets, trades, selectedCorpId, options } =
    useSelector((state: RootState) => state.user);
  const { corps } = useSelector((state: RootState) => state.stock);
  const { week, day, tick } = useSelector((state: RootState) => state.time);
  const { isChartView } = useSelector((state: RootState) => state.user);

  // container state
  const [stockBill, setStockBill] = useState<billType>({
    price: 0,
    quantity: 0,
  });
  const [tradeBill, setTradeBill] = useState<billType>({
    price: 0,
    quantity: 0,
  });

  useEffect(() => {
    const corpStock: ChartState = corps.find(
      (chart) => chart.corpId === selectedCorpId
    );
    const corpAsset: AssetState = assets.find(
      (asset) => asset.corpId === selectedCorpId
    );

    const stockBill = {
      // price: corpStock.todayChart[tick * 4 - 1] || 0,
      price: corpStock.todayChart[tick - 1] || 0,
      quantity: corpAsset.availableQuantity,
    };

    setStockBill(stockBill);
  }, [assets, selectedCorpId, corps, tick]);

  const dispatch = useDispatch();

  const handleDeal = (e: any) => {
    const deal = e.target.name;
    dispatch(
      tradeRequest({
        ...tradeBill,
        gameId,
        playerId,
        week,
        day,
        tick,
        corpId: selectedCorpId,
        deal,
      })
    );
  };

  const handleCancel = (_id: string, corpId: string) => {
    dispatch(tradeCancel({ gameId, playerId, week, day, tick, corpId, _id }));
  };

  return (
    <Trade
      trades={trades}
      corps={corps}
      selectedCorpId={selectedCorpId}
      stockBill={stockBill}
      tradeBill={tradeBill}
      isChartView={isChartView}
      setTradeBill={setTradeBill}
      handleDeal={handleDeal}
      handleCancel={handleCancel}
      disabled={options?.tradeoff}
    />
  );
};

export default TradeWrapper;
