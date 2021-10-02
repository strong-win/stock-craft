import React from "react";

import { messageType } from "../../modules/game";
import "../../styles/Chatting.css";
import Input from "./ChatInput";

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
    <>
      <h1>Chatting Container</h1>
      <div className="chatting">
        <div>name: {name}</div>
        <Messages name={name} messages={messages} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
    </>
  );
};

export default Chatting;
