import { MessageType } from "../modules/user";

const Chatting = ({ messages }: { messages: MessageType[] }) => {
  return (
    <div>
      <h1>Chatting Container</h1>

      {messages.map(({ user, text }, index) => (
        <div key={index}>
          {user} {text}
        </div>
      ))}
    </div>
  );
};

export default Chatting;
