import { Link } from "react-router-dom";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "reactstrap";

const RoomCodeModal = ({ room, isOpen, toggle, onChangeRoom }) => {
  return (
    <Modal className="roomCodeModal" size="lg" isOpen={isOpen} toggle={toggle}>
      <ModalHeader
        className="roomCodeModalHeader"
        toggle={toggle}
      ></ModalHeader>
      <ModalBody className="roomCodeModalBody">
        <Input
          className="mainInput mx-auto"
          placeholder="코드를 입력하세요"
          onChange={onChangeRoom}
        />
      </ModalBody>
      <ModalFooter className="roomCodeModalFooter">
        <Link
          onClick={(e) => (!room ? e.preventDefault() : null)}
          to={`/play?room=${room}`}
        >
          <Button className="EnterRoomButton">입장하기</Button>
        </Link>
      </ModalFooter>
    </Modal>
  );
};

export default RoomCodeModal;
