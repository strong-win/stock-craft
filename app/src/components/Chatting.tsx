import React from "react";
import { MessageType } from "../modules/user";

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
    <div>
      <h1>Chatting Container</h1>
      <h3>name: {name}</h3>

      {messages.map(({ user, text }, index) => (
        <div key={index}>
          {user} {text}
        </div>
      ))}

      <form>
        <input
          type="text"
          placeholder="메시지를 입력하세요."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
        />
        <button onClick={(e) => sendMessage(e)}>SEND</button>
      </form>
    </div>
  );
};

export default Chatting;
