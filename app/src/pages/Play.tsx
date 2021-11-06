import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";
import { Container, Row, Col } from "reactstrap";

import { RootState } from "..";
import ChattingWrapper from "../containers/ChattingWrapper";
import ClockWrapper from "../containers/ClockWrapper";
import TradeWrapper from "../containers/TradeWrapper";
import CorporationsWrapper from "../containers/CorporationsWrapper";
import { updateName, updateRoom, resetUser } from "../modules/user";
import { createName } from "../utils/create";
import WaitingRoom from "./WaitingRoom";
import Header from "../components/Header";
import { sendJoinConnected, sendJoinLeave } from "../modules/sockets/join";

import "../styles/Play.css";

const Play = ({ location, history }: any) => {
  const [isBlocking, setIsBlocking] = useState<boolean>(false);
  const { room: initRoom } = queryString.parse(location.search);

  const { playerId, name, room, status, isHost } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useDispatch();

  useEffect(() => {
    history.block((loc, action) => {
      if (action === "POP" && isBlocking) {
        if (window.confirm("정말 나가시겠습니까?")) {
          //TODO: host 처리 fe? be?
          dispatch(sendJoinLeave());
          return true;
        } else return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlocking]);

  useEffect(() => {
    const checkLeaveHandler = (e: any) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const leaveHandler = (e: any) => {
      //TODO: event handler
      dispatch(sendJoinLeave());
    };

    setIsBlocking(true);

    window.addEventListener("beforeunload", checkLeaveHandler);
    window.addEventListener("unload", leaveHandler);

    return () => {
      window.removeEventListener("beforeunload", checkLeaveHandler);
      window.removeEventListener("unload", leaveHandler);
      dispatch(resetUser());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    return () => {
      if (playerId === "") {
        history.push("/");
      }
      //TODO: 기능 개선 필요 (playerId update함수 진행 후에 바로 비교연산 수행 필요.)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, history, initRoom]);

  return status === "play" ? (
    <Container className="playContainer" fluid={true}>
      <Header isGameStart />
      <Row className="playRow1">
        <Col md="8">
          <CorporationsWrapper />
        </Col>
        <Col md="4">
          <ChattingWrapper room={room} name={name} />
        </Col>
      </Row>
      <Row className="playRow2">
        <Col md="8">
          <TradeWrapper />
        </Col>
      </Row>
    </Container>
  ) : (
    <WaitingRoom name={name} room={room} />
  );
};

export default Play;
