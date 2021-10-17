import "../../styles/Chatting.css";

type MessageProps = {
  name: string;
  user: string;
  text: string;
};

const Message = ({ name, user, text }: MessageProps) => {
  const isMessageByUser: boolean = name === user ? true : false;
  const isMessageByManager: boolean = user === "관리자";
  return isMessageByUser ? (
    <div className="messageWrapper justifyEnd">
      <div className="message myMessage">{text}</div>
    </div>
  ) : (
    <div className="messageWrapper justifyStart">
      <div>{user}</div>
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
