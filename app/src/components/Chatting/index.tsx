import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "reactstrap";
import { messageType } from "../../modules/user";
import { FiUser } from "react-icons/fi";

import "../../styles/Chatting.css";

import ChatInput from "./ChatInput";
import Messages from "./Messages";

type ChattingProps = {
  name: string;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (e: any) => void;
  messages: messageType[];
};

const Chatting = ({
  name,
  message,
  messages,
  setMessage,
  sendMessage,
}: ChattingProps) => {
  return (
    <Card className="chatting">
      <CardHeader>
        <FiUser /> {name}
      </CardHeader>
      <CardBody className="chattingBody">
        <Messages name={name} messages={messages} />
      </CardBody>
      <CardFooter>
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
