import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import Chart from "../components/Chart";
import Corporations from "../components/Corporations";
import { emitChartRequest } from "../modules/sockets/chart";
import { chartType } from "../modules/stock";
import { updateTime } from "../modules/time";
import { calculateNext } from "../utils/calculate";

const CorporationsWrapper = () => {
  // redux state
  const { room } = useSelector((state: RootState) => state.user);
  const { corps } = useSelector((state: RootState) => state.stock);
  const { week, day } = useSelector((state: RootState) => state.time);
  const dispatch = useDispatch();

  // container state
  const [isChartView, setIsChartView] = useState<boolean>(false);
  const [selectedCorpId, setSelectedCorpId] = useState<string>("");

  const onClickCorpItem = (corpId: string) => {
    setSelectedCorpId(corpId);
    if (corps.find((corp: chartType) => corp.corpId === corpId) !== undefined) {
      setIsChartView(true);
    } else {
      setIsChartView(false);
    }
  };

  const handleRefresh = (e: any) => {
    const { nextWeek, nextDay } = calculateNext(week, day);
    dispatch(emitChartRequest({ room, week: nextWeek, day: nextDay }));
    dispatch(updateTime({ week: nextWeek, day: nextDay }));
  };

  return isChartView ? (
    <Chart
      corp={corps.find((corp: chartType) => corp.corpId === selectedCorpId)}
      onClickBackButton={onClickCorpItem}
    />
  ) : (
    <Corporations
      corps={corps}
      onClickCorpItem={onClickCorpItem}
      handleRefresh={handleRefresh}
    />
  );
};

export default CorporationsWrapper;
