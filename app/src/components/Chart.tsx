import React from "react";
import { chartType } from "../modules/stock";

type ChartProps = {
  charts: chartType[];
  handleRefresh: React.MouseEventHandler<HTMLButtonElement>;
};

const Chart = ({ charts, handleRefresh }: ChartProps) => {
  return (
    <>
      <h1>Chart Container</h1>
      {charts.map((corp) => (
        <div key={corp.corpId}>
          <div>{corp.corpName}</div>
          {corp.todayChart.map((price, index) => (
            <div key={index}>
              <span>tick: {index + 1}</span>&nbsp;
              <span>price: {price}</span>
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleRefresh}>Next</button>
    </>
  );
};

export default Chart;
