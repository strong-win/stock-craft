import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Chatting from "../components/Chatting";
import { sendChatting } from "../modules/sockets/chatting";

const ChattingWrapper = ({ name, room }: { name: string; room: string }) => {
  const { playerId, messages, options, status, score, role, skills } =
    useSelector((state: RootState) => state.user);

  const dispatch = useDispatch();

  const [message, setMessage] = useState("");

  const sendMessage = (e: any) => {
    e.preventDefault();

    if (message) {
      if (skills?.cloaking) {
        dispatch(sendChatting({ playerId: skills?.cloaking, message }));
      } else {
        dispatch(sendChatting({ playerId, message }));
      }
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
      role={role}
      score={score}
      disabled={options?.chatoff}
    />
  );
};

export default ChattingWrapper;
