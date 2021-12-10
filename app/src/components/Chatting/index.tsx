import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Tooltip } from "reactstrap";
import { AssetState, CashState, MessageState } from "../../modules/user";
import { FiUser } from "react-icons/fi";

import "../../styles/Chatting.css";

import ChatInput from "./ChatInput";
import Messages from "./Messages";
import RoleCard from "./RoleCard";
import { ChartState } from "../../modules/stock";
import Ban from "../Ban";


type ChattingProps = {
  name: string;
  room: string;
  message: string;
  userStatus: string;
  cash: CashState;
  assets: AssetState[];
  corps: ChartState[];
  role: string;
  tick: number;
  disabled: boolean;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (e: any) => void;
  messages: MessageState[];
};

const Chatting = ({
  name,
  room,
  disabled = false,
  message,
  messages,
  userStatus,
  cash,
  role,
  corps,
  tick,
  assets,
  setMessage,
  sendMessage,
}: ChattingProps) => {
  const [isNickNameHover, setIsNickNameHover] = useState<boolean>(false);

  const handleNickNameHover = () => {
    setIsNickNameHover(!isNickNameHover);
  };
  return (
    <>
      <Ban disabled={disabled} />
      <Card className="chatting">
        <CardHeader className="chattingHeader">
          <div
            className="nickName"
            id="chattingNickName"
            onMouseOver={handleNickNameHover}
            onMouseOut={handleNickNameHover}
          >
            <FiUser /> {name}{" "}
          </div>
          <div className="roomCode">RoomCode: {room}</div>
        </CardHeader>
        <CardBody className="chattingBody">
          {userStatus === "play" && isNickNameHover && (
            <RoleCard
              assets={assets}
              corps={corps}
              tick={tick}
              cash={cash}
              role={role}
            />
          )}
          <Messages name={name} messages={messages} />
        </CardBody>
        <CardFooter className="chattingFooter">
          <ChatInput
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
            disabled={disabled}
          />
        </CardFooter>
      </Card>
    </>

  );
};

export default Chatting;
