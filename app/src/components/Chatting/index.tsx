import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "reactstrap";
import { MessageState } from "../../modules/user";
import { FiUser } from "react-icons/fi";

import "../../styles/Chatting.css";

import ChatInput from "./ChatInput";
import Messages from "./Messages";

type ChattingProps = {
  name: string;
  room: string;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (e: any) => void;
  messages: MessageState[];
};

const Chatting = ({
  name,
  room,
  message,
  messages,
  setMessage,
  sendMessage,
}: ChattingProps) => {
  return (
    <Card className="chatting">
      <CardHeader className="chattingHeader">
        <div className="nickName">
          <FiUser /> {name}{" "}
        </div>
        <div className="roomCode">RoomCode: {room}</div>
      </CardHeader>
      <CardBody className="chattingBody">
        <Messages name={name} messages={messages} />
      </CardBody>
      <CardFooter className="chattingFooter">
        <ChatInput
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </CardFooter>
    </Card>
  );
};

export default Chatting;
