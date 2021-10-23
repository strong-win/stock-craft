import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";
import { Container, Row, Col } from "reactstrap";

import { RootState } from "..";
import ChattingWrapper from "../containers/ChattingWrapper";
import ClockWrapper from "../containers/ClockWrapper";
import PlayersWrapper from "../containers/PlayersWrapper";
import TradeWrapper from "../containers/TradeWrapper";
import CorporationsWrapper from "../containers/CorporationsWrapper";
import { updateName, updateRoom } from "../modules/user";
import { createName } from "../utils/create";
import WaitingRoom from "./WaitingRoom";
import {
  sendJoinConnected,
} from "../modules/sockets/join";

const Play = ({ location, history }: any) => {
  const { room: initRoom } = queryString.parse(location.search);

  const { playerId, name, room, status, isHost } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useDispatch();

  useEffect(() => {
    let createdName: string;
    if (!name) {
      createdName = createName();
      dispatch(updateName(createdName));
    }

    if (typeof initRoom === "undefined") {
      history.push("/");
    }
    if (typeof initRoom === "string") {
      dispatch(updateRoom(initRoom));
      dispatch(
        sendJoinConnected({ name: name || createdName, room: initRoom, isHost })
      );
    }

  }, [dispatch, history, initRoom]);


  return status === "play" ? (
    <Container fluid={true}>
      <Row>
        <Col>
          <ClockWrapper />
        </Col>
      </Row>
      <Row>
        <Col md="8">
          <CorporationsWrapper />
        </Col>
        <Col md="4">
          <ChattingWrapper room={room} name={name} />
        </Col>
      </Row>
      <Row>
        <Col md="8">
          <TradeWrapper />
        </Col>
      </Row>
    </Container>
  ) : (
    <WaitingRoom name={name} room={room}/>
  );
};

export default Play;
