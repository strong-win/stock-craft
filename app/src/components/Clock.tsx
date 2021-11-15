import { useState, useEffect, useRef } from "react";
import { Col, Row } from "reactstrap";

import "../styles/Clock.css";

const Tick = {
  0: {
    status: "새벽",
    duration: 5,
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

function useInterval(callback, delay) {
  const savedCallback = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

const Clock = ({ week, day, tick, handleTimeOut }) => {
  const [second, setSecond] = useState<number>(15);
  const timer = useRef(null);

  useInterval(() => {
    setSecond(second - 1);
  }, 1000);

  useEffect(() => {
    if (second <= 0) {
      handleTimeOut();
    }
  }, [second]);

  useEffect(() => {
    if (day) setSecond(Tick[tick].duration);
    else setSecond(30);
  }, [tick]);

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
        <Col className={`time second ${second < 6 && "red"}`}>{second}</Col>
      </Row>
    </>
  );
};

export default Clock;
