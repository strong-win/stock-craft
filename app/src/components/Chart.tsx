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

type ChartData = {
  time: number;
  value: number;
};

type ChartProps = {
  data: {
    id: string;
    name: string;
    data: ChartData[];
  };
  onClickBackButton: (id: string) => void;
};

const Chart = ({ data, onClickBackButton }: ChartProps) => {
  return (
    <>
      <LineChart
        width={500}
        height={300}
        data={data?.data}
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
        {/* <Line
        type="monotone"
        dataKey="pv"
        stroke="#8884d8"
        activeDot={{ r: 8 }}
      /> */}
        <Line type="monotone" dataKey="value" stroke="#82ca9d" />
      </LineChart>
      <Button onClick={() => onClickBackButton("")}>뒤로가기</Button>
    </>
  );
};

export default Chart;
