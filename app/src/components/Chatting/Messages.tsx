import { useEffect, useRef } from "react";

import { messageType } from "../../modules/game";
import Message from "./Message";
import "../../styles/Chatting.css";

type ChattingProps = {
  name: string;
  messages: messageType[];
};

const Messages = ({ name, messages }: ChattingProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="messages">
      {messages.map(({ user, text }, index) => (
        <div key={index}>
          <Message name={name} user={user} text={text} />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
