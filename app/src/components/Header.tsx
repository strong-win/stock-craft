import { Row } from "reactstrap";

import ClockWrapper from "../containers/ClockWrapper";
import "../styles/Header.css";

const tickToTimeStatus = {
  0: "dawn",
  1: "morning",
  2: "noon",
  3: "evening",
  4: "night",
};

export default function Header({
  isGameStart = false,
  tick = null,
  day = null,
}) {
  const timeStatus = day ? tickToTimeStatus[tick] : "weekend";
  return (
    <Row className={`header ${isGameStart && timeStatus}`}>
      <div className={`col-md-4 offset-md-4 logo ${isGameStart && timeStatus}`}>
        <b>STOCK</b>CRAFT
      </div>
      {isGameStart && (
        <div
          className={`clockWrapper col-md-4 h-100 ${
            day === 0 && "weekendClockWrapper"
          }`}
        >
          <ClockWrapper />
        </div>
      )}
    </Row>
  );
}
