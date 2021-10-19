import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Chart from "../components/Chart";
import Corporations from "../components/Corporations";
import { chartType } from "../modules/stock";
import { updateSelectedCorpId } from "../modules/user";

const CorporationsWrapper = () => {
  // redux state
  const { corps } = useSelector((state: RootState) => state.stock);
  const { tick } = useSelector((state: RootState) => state.time);

  const dispatch = useDispatch();

  // container state
  const [isChartView, setIsChartView] = useState<boolean>(false);
  const [selectedCorpId, setSelectedCorpId] = useState<string>("");

  const onClickCorpItem = (corpId: string) => {
    setSelectedCorpId(corpId);
    if (corps.find((corp: chartType) => corp.corpId === corpId) !== undefined) {
      setIsChartView(true);
      dispatch(updateSelectedCorpId(corpId));
    } else {
      setIsChartView(false);
    }
  };

  return isChartView ? (
    <>
      <h1>Chart Container</h1>
      <Chart
        corp={corps.find((corp: chartType) => corp.corpId === selectedCorpId)}
        tick={tick}
        onClickBackButton={onClickCorpItem}
      />
    </>
  ) : (
    <>
      <h1>Corporation Container</h1>
      <Corporations corps={corps} onClickCorpItem={onClickCorpItem} />
    </>
  );
};

export default CorporationsWrapper;
