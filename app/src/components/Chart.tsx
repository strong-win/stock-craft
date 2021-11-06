import { ChartState } from "../modules/stock";

import { Button, Col, Row } from "reactstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import "../styles/Chart.css";

type ChartProps = {
  corp: ChartState;
  tick: number;
  onClickBackButton: (id: string) => void;
};

const Chart = ({ corp, tick, onClickBackButton }: ChartProps) => {
  tick = tick % 4 === 0 ? 3 : tick;
  const ChartData = [...corp.totalChart, ...corp.todayChart.slice(0, tick)];
  const prevPrice = corp.totalChart.at(-1);
  const nowPrice = corp.todayChart[tick - 1];
  const rate = ((nowPrice - prevPrice) / prevPrice) * 100;
  const gap = nowPrice - prevPrice;
  let color = "";
  if (rate > 0) color = "red";
  else if (rate < 0) color = "blue";

  return (
    <>
      <Row className="chartHeader">
        <Col>
          <Button
            className="backButton"
            color="link"
            onClick={() => onClickBackButton("")}
          >
            {"<"}
          </Button>
        </Col>
        <Col>{corp.corpName}</Col>
        <Col>{nowPrice ? nowPrice : "-"}</Col>
        <Col className={color}>{gap ? gap : "-"}</Col>
        <Col className={color}>{rate ? rate.toFixed(2) : "-"}%</Col>
      </Row>
      <LineChart
        width={800}
        height={400}
        data={ChartData.map((value, index) => ({ time: index, value }))}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey="time" hide={true} />
        <YAxis hide={true} />
        <Tooltip />
        <Line type="linear" dataKey="value" strokeWidth={3} stroke={color} />
      </LineChart>
    </>
  );
};

export default Chart;
