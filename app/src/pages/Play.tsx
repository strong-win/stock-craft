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
import { chattingJoin } from "../modules/sockets/chatting";
import { gameStartRequest } from "../modules/sockets/game";
import { createName } from "../utils/create";

const Play = ({ location, history }: any) => {
  const { room: initRoom } = queryString.parse(location.search);

  const { name, room, started } = useSelector((state: RootState) => state.user);
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
      dispatch(chattingJoin({ name: name || createdName, room: initRoom }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, history, initRoom]);

  const onGameStart = (e: any) => {
    dispatch(gameStartRequest({ room }));
  };

  return started ? (
    <Container fluid={true}>
      <Row>
        <Col>
          <ClockWrapper />
        </Col>
        <Col>
          <PlayersWrapper room={room} />
        </Col>
      </Row>
      <Row>
        <Col md="8">
          <CorporationsWrapper />
        </Col>
        <Col md="4">
          <ChattingWrapper name={name} />
        </Col>
      </Row>
      <Row>
        <Col md="8">
          <TradeWrapper />
        </Col>
      </Row>
    </Container>
  ) : (
    <>
      <button onClick={onGameStart}>START</button>
    </>
  );
};

export default Play;
