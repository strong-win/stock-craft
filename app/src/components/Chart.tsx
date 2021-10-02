import React from "react";
import { corpType } from "../modules/stock";

type ChartProps = {
  dayTicks: corpType[][];
  handleRefresh: React.MouseEventHandler<HTMLButtonElement>;
};

const Chart = ({ dayTicks, handleRefresh }: ChartProps) => {
  return (
    <>
      <h1>Chart Container</h1>
      {dayTicks.map((tick, i) => (
        <div key={i}>
          <div>tick: {i + 1}</div>
          {tick.map((corp, j) => (
            <div key={j}>
              <span>{corp.ticker}</span>
              <span>{corp.corpName}</span>
              <span>{corp.price}</span>
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleRefresh}>Next</button>
    </>
  );
};

export default Chart;
