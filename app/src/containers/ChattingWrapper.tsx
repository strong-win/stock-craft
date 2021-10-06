import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Chatting from "../components/Chatting";
import { chattingRequest } from "../modules/sockets/chatting";
import { messageType } from "../modules/user";

const ChattingWrapper = ({ name }: { name: string }) => {
  const messages: messageType[] = useSelector(
    (state: RootState) => state.user.messages
  );
  const dispatch = useDispatch();

  const [message, setMessage] = useState("");

  const sendMessage = (e: any) => {
    e.preventDefault();

    if (message) {
      dispatch(chattingRequest(message));
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
