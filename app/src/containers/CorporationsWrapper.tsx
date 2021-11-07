import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Chart from "../components/Corporations/Chart";
import ChartTab from "../components/Corporations";
import { ChartState } from "../modules/stock";
import { updateSelectedCorpId } from "../modules/user";

const CorporationsWrapper = () => {
  // redux state
  const { corps } = useSelector((state: RootState) => state.stock);
  const { tick } = useSelector((state: RootState) => state.time);
  const { assets } = useSelector((state: RootState) => state.user);

  const dispatch = useDispatch();

  // container state
  const [isChartView, setIsChartView] = useState<boolean>(false);
  const [selectedCorpId, setSelectedCorpId] = useState<string>("");

  const onClickCorpItem = (corpId: string) => {
    setSelectedCorpId(corpId);
    if (
      corps.find((corp: ChartState) => corp.corpId === corpId) !== undefined
    ) {
      setIsChartView(true);
      dispatch(updateSelectedCorpId(corpId));
    } else {
      setIsChartView(false);
    }
  };

  //최상단은 tab으로 분기하고
  //chart view/corporation view 분기는 Corporation에서 하기 (chart 경로 옮기기)
  return (
    <ChartTab
      tick={tick}
      assets={assets}
      corps={corps}
      onClickCorpItem={onClickCorpItem}
      selectedCorpId={selectedCorpId}
    />
  );
};

export default CorporationsWrapper;
