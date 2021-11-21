import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Chatting from "../components/Chatting";
import { sendChatting } from "../modules/sockets/chatting";

const ChattingWrapper = ({ name, room }: { name: string; room: string }) => {
  const { playerId, messages, status } = useSelector(
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
      room={room}
      message={message}
      setMessage={setMessage}
      sendMessage={sendMessage}
      messages={messages}
      userStatus={status}
    />
  );
};

export default ChattingWrapper;
