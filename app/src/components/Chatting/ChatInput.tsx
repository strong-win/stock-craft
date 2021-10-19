import { InputGroup, Input, Button, InputGroupAddon } from "reactstrap";

type ChatInputProps = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (e: any) => void;
};

const ChatInput = ({ message, setMessage, sendMessage }: ChatInputProps) => {
  return (
    <InputGroup>
      <Input
        type="text"
        placeholder="메시지를 입력하세요."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
      />
      <InputGroupAddon addonType="append">
        <Button onClick={(e) => sendMessage(e)}>SEND</Button>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default ChatInput;
