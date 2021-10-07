import "../../styles/Chatting.css";

type MessageProps = {
  name: string;
  user: string;
  text: string;
};

const Message = ({ name, user, text }: MessageProps) => {
  const isMessageByUser: boolean = name === user ? true : false;
  return isMessageByUser ? (
    <div className="message justifyEnd">
      {user} {text}
    </div>
  ) : (
    <div className="message justifyStart">
      {text} {user}
    </div>
  );
};

export default Message;
