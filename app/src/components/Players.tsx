import React from "react";
import {
  Row,
  Col,
  Container
} from "reactstrap";
import {BsFillCircleFill} from "react-icons/bs";

import { PlayerState } from "../modules/user";
import "../styles/Players.css";

type PlayersProps = {
  players: PlayerState[];
};

const Players = ({ players }: PlayersProps) => {

  const playerComponent = players.map(({ name }, index) => (
    <Row className="player">
    <Col className="readyState" md="1"><BsFillCircleFill size="10"/></Col>
    <Col key={index}>
      {name}
    </Col>
    </Row>
  ));

  return (
    <Container>
      <div className="playersCount">현재 방 참여 인원 : <b>{players.length}</b>명</div>
      {playerComponent}
    </Container>
  );
};

export default Players;
