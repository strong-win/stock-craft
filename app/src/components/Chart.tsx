import { chartType } from "../modules/stock";

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

type ChartProps = {
  corp: chartType;
  onClickBackButton: (id: string) => void;
};

const Chart = ({ corp, onClickBackButton }: ChartProps) => {
  return (
    <>
      <LineChart
        width={500}
        height={300}
        data={corp?.todayChart.map((value, index) => ({ time: index, value }))}
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
        <Legend />
        <Line type="monotone" dataKey="value" stroke="red" />
      </LineChart>
      <Button onClick={() => onClickBackButton("")}>뒤로가기</Button>
    </>
  );
};

export default Chart;
