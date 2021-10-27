import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Chatting from "../components/Chatting";
import { sendChatting } from "../modules/sockets/chatting";

const ChattingWrapper = ({ name }: { name: string }) => {
  const { playerId, messages } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useDispatch();

  const [message, setMessage] = useState("");

  const sendMessage = (e: any) => {
    e.preventDefault();

    if (message) {
      dispatch(sendChatting({ playerId, message }));
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
