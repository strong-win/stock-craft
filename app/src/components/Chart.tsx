import { chartType } from "../modules/stock";

import { Button } from "reactstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type ChartProps = {
  corp: chartType;
  tick: number;
  onClickBackButton: (id: string) => void;
};

const Chart = ({ corp, tick, onClickBackButton }: ChartProps) => {
  const ChartData = [...corp.totalChart, ...corp.todayChart.slice(0, tick)];
  const color =
    ChartData[ChartData.length - 2] < ChartData[ChartData.length - 1]
      ? "red"
      : "blue";
  return (
    <>
      <LineChart
        width={700}
        height={300}
        data={ChartData.map((value, index) => ({ time: index, value }))}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="linear" dataKey="value" stroke={color} />
      </LineChart>
      <Button onClick={() => onClickBackButton("")}>뒤로가기</Button>
    </>
  );
};

export default Chart;
