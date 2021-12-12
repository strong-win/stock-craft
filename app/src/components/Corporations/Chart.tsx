import { ChartState } from "../../modules/stock";
import { AssetState } from "../../modules/user";

import { Button, Col, Row } from "reactstrap";
import { MdArrowBack } from "react-icons/md";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
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

  const chartHeaderCommonData = [
    {
      key: "종목명",
      value: corp?.corpName,
    },
    {
      key: "현재가격",
      value: nowPrice ? nowPrice : "-",
    },
    {
      key: "대비",
      value: gap ? gap : "-",
      color: true,
    },
    {
      key: "등락률",
      value: `${rate ? Math.floor(rate) : "-"}%`,
      color: true,
    },
  ];

  const chartHeaderMyData = [
    {
      key: "종목명",
      value: corp?.corpName,
    },
    {
      key: "보유량",
      value: asset?.totalQuantity,
    },
    {
      key: "평단가",
      value: Math.floor(averagePrice),
    },
    {
      key: "현재가격",
      value: nowPrice ? nowPrice : "-",
    },
    {
      key: "이익",
      value: Math.floor(nowPrice - averagePrice),
      color: true,
    },
    {
      key: "수익률",
      value: `${
        asset?.totalQuantity
          ? Math.floor(((nowPrice - averagePrice) / averagePrice) * 100)
          : 0
      }%`,
      color: true,
    },
  ];

  const chartHeaderData = asset ? chartHeaderMyData : chartHeaderCommonData;
  const chartHeaderItems = chartHeaderData.map((header) => (
    <Col className="chartHeaderItem">
      <label>{header.key}</label>
      <div className={`chartHeaderContent ${header.color ? color : ""}`}>
        {header.value}
      </div>
    </Col>
  ));

  return (
    <>
      <Row className="chartHeader">
        <Col>
          <Button
            className="backButton"
            color="link"
            onClick={() => onClickBackButton("")}
          >
            <MdArrowBack />
          </Button>
        </Col>
        {chartHeaderItems}
      </Row>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart
          width={500}
          height={300}
          data={chartData.map((value, index) => ({ time: index, value }))}
          margin={{
            top: 5,
            right: 30,
            left: 30,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <YAxis axisLine={false} />
          <XAxis dataKey="time" hide={true} />
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
      </ResponsiveContainer>
    </>
  );
};

export default Chart;
