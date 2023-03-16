import { useState, useEffect, useRef } from "react";
import { Col, Row } from "reactstrap";
import { toast } from "react-toastify";

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

  const isDark = day === 0 || tick % 4 === 0;

  useInterval(() => {
    if (second >= 0) setSecond(second - 1);
  }, 1000);

  useEffect(() => {
    if (second === 0) {
      handleTimeOut();
    } else if (second < 0) {
      toast.error("네트워크 오류로 시간이 지연됩니다. 잠시만 기다려주세요");
    }
  }, [second]);

  useEffect(() => {
    if (day) setSecond(Tick[tick]?.duration);
    else setSecond(30);
  }, [tick]);

  useEffect(() => {
    if (day === 1) setSecond(Tick[tick]?.duration);
  }, [day]);

  return (
    <>
      <Row className={`clockContainer justify-content-end ${isDark && "dark"}`}>
        <Col className="time week">Week {week}</Col>
        {day > 0 ? (
          <>
            <Col className="time day">day {day}</Col>
            <Col className="time tick">{Tick[tick]?.status}</Col>
          </>
        ) : (
          <Col className="time day">주말</Col>
        )}
        <Col
          className={`time second ${second < 6 && "red"} ${
            isDark && "darkSecond"
          }`}
        >
          {second}
        </Col>
      </Row>
    </>
  );
};

export default Clock;
