import { useEffect, useRef } from "react";

import { MessageState } from "../../modules/user";
import Message from "./Message";
import "../../styles/Chatting.css";

type ChattingProps = {
  name: string;
  messages: MessageState[];
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
          <Message
            hideName={index && messages[index - 1].user === user}
            name={name}
            user={user}
            text={text}
          />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
