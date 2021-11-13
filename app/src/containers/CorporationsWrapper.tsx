import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import ChartTab from "../components/Corporations";
import { ChartState } from "../modules/stock";
import { updateSelectedCorpId, updateIsChartView } from "../modules/user";

const CorporationsWrapper = () => {
  // redux state
  const { corps } = useSelector((state: RootState) => state.stock);
  const { tick } = useSelector((state: RootState) => state.time);
  const { assets } = useSelector((state: RootState) => state.user);

  const dispatch = useDispatch();

  // container state
  const [selectedCorpId, setSelectedCorpId] = useState<string>("");

  const onClickCorpItem = (corpId: string) => {
    setSelectedCorpId(corpId);
    if (
      corps.find((corp: ChartState) => corp.corpId === corpId) !== undefined
    ) {
      dispatch(updateIsChartView(true));
      dispatch(updateSelectedCorpId(corpId));
    } else {
      dispatch(updateIsChartView(false));
    }
  };

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
