import React from "react";
import { Jumbotron } from "reactstrap";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

import { timeType } from "../modules/time";

type TimeCardProps = {
  num: number;
  unit: string;
};

const TimeCard = ({ num, unit }: TimeCardProps) => {
  return (
    <Jumbotron>
      <h1 className="display-3">{num}</h1>
      <hr className="my-2" />
      <p className="lead">{unit}</p>
    </Jumbotron>
  );
};

const Clock = ({ week, day, tick }: timeType) => {
  return (
    <>
      <h1>Clock Container</h1>
      <div className="d-flex flex-row">
        <TimeCard num={week} unit="week" />
        <TimeCard num={day} unit="day" />
        <TimeCard num={tick} unit="tick" />
        <CountdownCircleTimer
          isPlaying
          duration={15}
          onComplete={() => [true, 0]}
          colors={[
            ["#008000", 0.5],
            ["#ffa500", 0.25],
            ["#ff0000", 0.25],
          ]}
        >
          {({ remainingTime }) => remainingTime}
        </CountdownCircleTimer>
      </div>
    </>
  );
};

export default Clock;
