import { Container, Row, Col } from "reactstrap";

import Tutorial from "../components/Tutorial";
import PlayersWrapper from "../containers/PlayersWrapper";
import ReadyWrapper from "../containers/ReadyWrapper";
import ChattingWrapper from "../containers/ChattingWrapper";
import Header from "../components/Header";

import "../styles/WaitingRoom.css";

type WaitingRoomProps = {
  room: string;
  name: string;
};

const WaitingRoom = ({ room, name }: WaitingRoomProps) => {
  return (
    <Container className="WaitingRoomContainer" fluid={true}>
      <Header />
      <Row className="body">
        <Col md="8" className="h-100 p-0">
          <Row className="row1">
            <Tutorial />
          </Row>
          <Row className="row2">
            <Col className="h-100 border">
              <PlayersWrapper room={room} />
            </Col>
            <Col className="h-100 border readyContainer">
              <ReadyWrapper />
            </Col>
          </Row>
        </Col>
        <Col md="4" className="p-0 border">
          <ChattingWrapper room={room} name={name} />
        </Col>
      </Row>
    </Container>
  );
};

export default WaitingRoom;
