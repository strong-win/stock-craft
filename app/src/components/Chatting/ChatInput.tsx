import { InputGroup, Input, Button, InputGroupAddon } from "reactstrap";
import { RiSendPlane2Fill } from "react-icons/ri";
type ChatInputProps = {
  message: string;
  disabled: boolean;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (e: any) => void;
};

const ChatInput = ({
  disabled,
  message,
  setMessage,
  sendMessage,
}: ChatInputProps) => {
  return (
    <InputGroup className="chattingInputWrapper">
      <Input
        type="text"
        className="chattingInput"
        placeholder="메시지를 입력하세요."
        disabled={disabled}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
      />
      <InputGroupAddon addonType="append">
        <Button
          className="chattingSendButton"
          color="link"
          onClick={(e) => sendMessage(e)}
        >
          <RiSendPlane2Fill />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default ChatInput;
