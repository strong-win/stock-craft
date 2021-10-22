import React from "react";
import { Jumbotron } from "reactstrap";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

import { TimeState } from "../modules/time";
import "../styles/Clock.css";

type TimeCardProps = {
  num: number;
  unit: string;
};

const TimeCard = ({ num, unit }: TimeCardProps) => {
  return (
    <Jumbotron className="TimeCard">
      <h5>{num}</h5>
      <hr className="my-2" />
      <p>{unit}</p>
    </Jumbotron>
  );
};

const Clock = ({ week, day, tick }: TimeState) => {
  return (
    <>
      <div className="d-flex flex-row">
        <TimeCard num={week} unit="week" />
        <TimeCard num={day} unit="day" />
        <TimeCard num={tick} unit="tick" />
        <div className="m-3">
          <CountdownCircleTimer
            isPlaying
            duration={15}
            onComplete={() => [true, 0]}
            colors={[
              ["#008000", 0.5],
              ["#ffa500", 0.25],
              ["#ff0000", 0.25],
            ]}
            size={70}
          >
            {({ remainingTime }) => remainingTime}
          </CountdownCircleTimer>
        </div>
      </div>
    </>
  );
};

export default Clock;
