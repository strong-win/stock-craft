import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Chatting from "../components/Chatting";
import { sendChatting } from "../modules/sockets/chatting";

const ChattingWrapper = ({ name, room }: { name: string; room: string }) => {
  const { playerId, messages, options, status, cash, assets, role, skills } =
    useSelector((state: RootState) => state.user);

  const { tick } = useSelector((state: RootState) => state.time);

  const { corps } = useSelector((state: RootState) => state.stock);

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
      cash={cash}
      corps={corps}
      tick={tick}
      role={role}
      assets={assets}
      disabled={options?.chatoff}
    />
  );
};

export default ChattingWrapper;
