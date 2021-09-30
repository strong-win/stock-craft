import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import Chatting from "../components/Chatting";
import { emitMessage } from "../modules/sockets";
import { MessageType } from "../modules/user";

const ChattingWrapper = ({ name }: { name: string }) => {
  const messages: MessageType[] = useSelector(
    (state: RootState) => state.user.messages
  );
  const dispatch = useDispatch();

  const [message, setMessage] = useState("");

  const sendMessage = (e: any) => {
    e.preventDefault();

    if (message) {
      dispatch(emitMessage(message));
      setMessage("");
    }
  };

  return (
    <Chatting
      name={name}
      message={message}
      setMessage={setMessage}
      sendMessage={sendMessage}
      messages={messages}
    />
  );
};

export default ChattingWrapper;
