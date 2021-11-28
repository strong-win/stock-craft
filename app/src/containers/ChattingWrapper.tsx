import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Chatting from "../components/Chatting";
import { sendChatting } from "../modules/sockets/chatting";

const ChattingWrapper = ({ name, room }: { name: string; room: string }) => {
  const { playerId, messages, status, cash, assets, role } = useSelector(
    (state: RootState) => state.user
  );

  const { tick } = useSelector((state: RootState) => state.time);

  const { corps } = useSelector((state: RootState) => state.stock);

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
      cash={cash}
      corps={corps}
      tick={tick}
      role={role}
      assets={assets}
    />
  );
};

export default ChattingWrapper;
