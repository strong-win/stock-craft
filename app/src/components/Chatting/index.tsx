import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Tooltip } from "reactstrap";
import { MessageState, PlayerScore } from "../../modules/user";
import { FiUser } from "react-icons/fi";

import "../../styles/Chatting.css";

import ChatInput from "./ChatInput";
import Messages from "./Messages";
import RoleCard from "./RoleCard";
import Ban from "../Ban";
import { ChartState } from "../../modules/stock";

type ChattingProps = {
  name: string;
  room: string;
  message: string;
  userStatus: string;
  score: PlayerScore;
  role: string;
  corps: ChartState[];
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
  score,
  corps,
  role,
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
            <RoleCard score={score} role={role} corps={corps} />
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
