import { ChartState } from "../../modules/stock";
import { AssetState } from "../../modules/user";

import { Button, Col, Row } from "reactstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

import "../../styles/Chart.css";

type ChartProps = {
  corp: ChartState;
  tick: number;
  asset?: AssetState;
  onClickBackButton: (id: string) => void;
};

const Chart = ({ corp, tick, onClickBackButton, asset }: ChartProps) => {
  tick = tick % 4 === 0 ? 3 : tick;
  const chartData = [...corp.totalChart, ...corp.todayChart.slice(0, tick)];
  const prevPrice = chartData.at(-2);
  const nowPrice = chartData.at(-1);
  const rate = ((nowPrice - prevPrice) / prevPrice) * 100;
  const gap = nowPrice - prevPrice;
  const averagePrice =
    (asset && asset.purchaseAmount / asset.totalQuantity) || 0;
  let color = "black";
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
        {asset ? (
          <>
            <Col>{asset.totalQuantity}</Col>
            <Col>{averagePrice.toFixed(2)}</Col>
            <Col>{nowPrice ? nowPrice : "-"}</Col>
            <Col className={color}>{nowPrice - averagePrice}</Col>
            <Col className={color}>
              {asset.totalQuantity
                ? (((nowPrice - averagePrice) / averagePrice) * 100).toFixed(2)
                : 0}
              %
            </Col>
          </>
        ) : (
          <>
            <Col>{nowPrice ? nowPrice : "-"}</Col>
            <Col className={color}>{gap ? gap : "-"}</Col>
            <Col className={color}>{rate ? rate.toFixed(2) : "-"}%</Col>
          </>
        )}
      </Row>
      <LineChart
        width={800}
        height={400}
        data={chartData.map((value, index) => ({ time: index, value }))}
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
        {asset && (
          <ReferenceLine
            y={asset.purchaseAmount / asset.totalQuantity || null}
            strokeWidth={3}
            strokeDasharray="5 5"
            stroke="purple"
          />
        )}
      </LineChart>
    </>
  );
};

export default Chart;
