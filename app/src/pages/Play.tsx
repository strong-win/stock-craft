import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";
import { Container, Row, Col } from "reactstrap";

import { RootState } from "..";
import ChattingWrapper from "../containers/ChattingWrapper";
import TradeWrapper from "../containers/TradeWrapper";
import ItemsWrapper from "../containers/ItemsWrapper";
import CorporationsWrapper from "../containers/CorporationsWrapper";
import AssetWrapper from "../containers/AssetWrapper";
import { updateName, updateRoom, resetUser } from "../modules/user";
import { createName } from "../utils/create";
import WaitingRoom from "./WaitingRoom";
import Header from "../components/Header";
import { sendJoinConnected, sendJoinLeave } from "../modules/sockets/join";

import "../styles/Play.css";
import RoleNoticeModal from "../components/RoleNoticeModal";

const Play = ({ location, history }: any) => {
  const [isBlocking, setIsBlocking] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<"items" | "tradeList">(
    "items"
  );
  const [isShowRoleModal, setIsShowRoleModal] = useState<boolean>(true);
  const { room: initRoom } = queryString.parse(location.search);
  const { week, day, tick } = useSelector((state: RootState) => state.time);
  const { playerId, name, room, status, isHost, role } = useSelector(
    (state: RootState) => state.user
  );

  const dispatch = useDispatch();

  const isShowItems: boolean = day === 0 || tick % 4 === 0;

  useEffect(() => {
    history.block((loc, action) => {
      if (action === "POP" && isBlocking) {
        if (window.confirm("정말 나가시겠습니까?")) {
          //TODO: host 처리 fe? be?
          dispatch(sendJoinLeave({ room }));
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
      dispatch(sendJoinLeave({ room }));
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
    if (status === "play") {
      setIsShowRoleModal(true);
      setTimeout(() => {
        setIsShowRoleModal(false);
      }, 5000);
    }
  }, [status]);

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
      <RoleNoticeModal
        isShowRoleModal={isShowRoleModal}
        setIsShowRoleModal={setIsShowRoleModal}
        role={role}
      />
      <Header isGameStart day={day} tick={tick} />
      <Row className="playRow1">
        <Col md="8">
          <CorporationsWrapper />
        </Col>
        <Col md="4" className="chattingContainer">
          <ChattingWrapper room={room} name={name} />
        </Col>
      </Row>
      <Row className="playRow2">
        <Col md="8" className="h-100">
          {isShowItems ? <ItemsWrapper /> : <TradeWrapper />}
        </Col>
        <Col md="4">
          <AssetWrapper />
        </Col>
      </Row>
    </Container>
  ) : (
    <WaitingRoom name={name} room={room} />
  );
};

export default Play;
