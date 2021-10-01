import React from "react";

import { MessageType } from "../../modules/user";
import "../../styles/Chatting.css";
import Input from "./Input";

import Messages from "./Messages";

type ChattingProps = {
  name: string;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (e: any) => void;
  messages: MessageType[];
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
        <h3>name: {name}</h3>
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
