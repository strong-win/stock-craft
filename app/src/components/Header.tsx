import { Row, Col } from "reactstrap";

import ClockWrapper from "../containers/ClockWrapper";
import "../styles/Header.css";

export default function Header({ isGameStart = false }) {
  return (
    <Row className="header">
      <div className="col-md-4  offset-md-4 logo">
        <b>STOCK</b>CRAFT
      </div>
      {isGameStart && (
        <div className="col-md-4 height-100">
          <ClockWrapper />
        </div>
      )}
    </Row>
  );
}
