import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";

import { tradeCancel } from "../modules/sockets/trade";

import ItemsAndTradeListTab from "../components/ItemsAndTradeListTab";
import Items from "../components/Items";
import TradeList from "../components/Trade/TradeList";
const itemsMockData = ["informationPaper", "allocation"];

const ItemsWrapper = () => {
  // redux state
  const [selectedTab, setSelectedTab] = useState<"items" | "tradeList">(
    "items"
  );
  const { gameId, playerId, trades, selectedCorpId } = useSelector(
    (state: RootState) => state.user
  );
  const { corps } = useSelector((state: RootState) => state.stock);

  const { week, day, tick } = useSelector((state: RootState) => state.time);

  useEffect(() => {}, []);

  const dispatch = useDispatch();

  const handleChangeSelected = (e) => {
    setSelectedTab(e.target.id);
  };
  const handleCancel = (_id: string, corpId: string) => {
    dispatch(tradeCancel({ gameId, playerId, week, day, tick, corpId, _id }));
  };
  return (
    <>
      <ItemsAndTradeListTab
        selected={selectedTab}
        handleChangeSelected={handleChangeSelected}
      />
      {selectedTab === "items" && <Items items={itemsMockData} />}
      {selectedTab === "tradeList" && (
        <TradeList
          trades={trades}
          corps={corps}
          selectedCorpId={selectedCorpId}
          handleCancel={handleCancel}
        />
      )}
    </>
  );
};

export default ItemsWrapper;
