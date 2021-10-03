import React from "react";
import { Button } from "reactstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { chartDataType } from "./Corporations";

type ChartProps = {
  corp: {
    id: string;
    name: string;
    chartData: chartDataType[];
  };
  onClickBackButton: (id: string) => void;
};

const Chart = ({ corp, onClickBackButton }: ChartProps) => {
  return (
    <>
      <LineChart
        width={500}
        height={300}
        data={corp?.chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#82ca9d" />
      </LineChart>
      <Button onClick={() => onClickBackButton("")}>뒤로가기</Button>
    </>
  );
};

export default Chart;
