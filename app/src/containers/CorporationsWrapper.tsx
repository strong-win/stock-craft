import React, { useState } from "react";
import Chart from "../components/Chart";
import Corporations from "../components/Corporations";

const MockData = [
  {
    id: "gyu",
    name: "규희전자",
    chartData: [
      {
        time: 0,
        value: 1,
      },
      {
        time: 1,
        value: 5,
      },
      {
        time: 2,
        value: 9,
      },
      {
        time: 3,
        value: 10,
      },
    ],
  },
  {
    id: "kang",
    name: "창구물산",
    chartData: [
      {
        time: 0,
        value: 5,
      },
      {
        time: 1,
        value: 2,
      },
      {
        time: 2,
        value: 9,
      },
      {
        time: 3,
        value: 1,
      },
    ],
  },
  {
    id: "han",
    name: "상일제약",
    chartData: [
      {
        time: 0,
        value: 3,
      },
      {
        time: 1,
        value: 5,
      },
      {
        time: 2,
        value: 10,
      },
      {
        time: 3,
        value: 15,
      },
    ],
  },
  {
    id: "lee",
    name: "호준건설",
    chartData: [
      {
        time: 0,
        value: 1,
      },
      {
        time: 1,
        value: 7,
      },
      {
        time: 2,
        value: 3,
      },
      {
        time: 3,
        value: 5,
      },
    ],
  },
];

const CorporationsWrapper = () => {
  const [isChartView, setIsChartView] = useState<boolean>(false);
  const [selectedCorpId, setSelectedCorpId] = useState<string>("");

  const onClickCorpItem = (id: string) => {
    setSelectedCorpId(id);
    if (MockData.find((corp) => corp.id === id) !== undefined) {
      setIsChartView(true);
    } else setIsChartView(false);
  };

  return isChartView ? (
    <Chart
      corp={MockData.find((corp) => corp.id === selectedCorpId)}
      onClickBackButton={onClickCorpItem}
    />
  ) : (
    <Corporations corps={MockData} onClickCorpItem={onClickCorpItem} />
  );
};

export default CorporationsWrapper;
