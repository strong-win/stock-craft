type InputProps = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (e: any) => void;
};

const Input = ({ message, setMessage, sendMessage }: InputProps) => {
  return (
    <form>
      <input
        type="text"
        placeholder="메시지를 입력하세요."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
      />
      <button onClick={(e) => sendMessage(e)}>SEND</button>
    </form>
  );
};

export default Input;
