import "../../styles/Chatting.css";

type MessageProps = {
  name: string;
  user: string;
  text: string;
  hideName: boolean;
};

const Message = ({ hideName, name, user, text }: MessageProps) => {
  const isMessageByUser: boolean = name === user ? true : false;
  const isMessageByManager: boolean = user === "관리자";
  return isMessageByUser ? (
    <div className="messageWrapper justifyEnd">
      <div className="message myMessage">{text}</div>
    </div>
  ) : (
    <div className="messageWrapper justifyStart">
      {!hideName && <div>{user}</div>}
      <div
        className={
          isMessageByManager
            ? "message managerMessage"
            : "message playerMessage"
        }
      >
        {text}
      </div>
    </div>
  );
};

export default Message;
