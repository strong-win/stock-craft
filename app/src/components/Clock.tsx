import { Col, Row } from "reactstrap";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

import { TimeState } from "../modules/time";
import "../styles/Clock.css";

const Tick = {
  0: {
    status: "새벽",
    duration: 15,
  },
  1: {
    status: "아침",
    duration: 15,
  },
  2: {
    status: "점심",
    duration: 15,
  },
  3: {
    status: "저녁",
    duration: 15,
  },
  4: {
    status: "밤",
    duration: 15,
  },
};

const Clock = ({ week, day, tick }: TimeState) => {
  return (
    <>
      <Row className="clockWrapper justify-content-end">
        <Col className="time week">Week {week}</Col>
        {day > 0 ? (
          <>
            <Col className="time day">day {day}</Col>
            <Col className="time tick">{Tick[tick]?.status}</Col>
          </>
        ) : (
          <Col className="time day">주말</Col>
        )}
        <Col>
          <CountdownCircleTimer
            isPlaying
            duration={Tick[tick]?.duration}
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
        </Col>
      </Row>
    </>
  );
};

export default Clock;
