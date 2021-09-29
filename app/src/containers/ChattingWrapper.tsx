import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "..";
import Chatting from "../components/Chatting";
import { MessageType } from "../modules/user";

const ChattingWrapper = () => {
  const messages: MessageType[] = useSelector(
    (state: RootState) => state.user.messages,
    shallowEqual
  );
  return <Chatting messages={messages} />;
};

export default ChattingWrapper;
