import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { ITEM } from "../../constants/item";
import "../../styles/Items.css";

const ItemTargetModal = ({
  toggle,
  isOpen,
  players,
  playerId,
  handleApplyItem,
  selectedItemId,
  setSelectedItemId,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");

  const playerItems = players.map((player) => {
    if (player.playerId !== playerId) {
      return <option value={player.playerId}>{player.name}</option>;
    }
  });

  const onChangeSelection = (e: any) => {
    setSelectedTargetId(e.target.value);
  };

  const handleApplyItemWithTarget = () => {
    if (selectedTargetId == "") {
      alert("사용자를 선택해주세요!");
    } else {
      handleApplyItem(selectedItemId, selectedTargetId);
      setSelectedItemId("");
      setSelectedTargetId("");
    }
  };

  return (
    <Modal
      className="itemTargetModal"
      size="lg"
      isOpen={isOpen}
      toggle={toggle}
    >
      <ModalHeader
        className="itemTargetModalHeader"
        toggle={toggle}
      ></ModalHeader>
      <ModalBody className="itemTargetModalBody">
        <div className="targetSelectLabel">
          {ITEM[selectedItemId]?.NAME} 아이템을 적용할 사용자를 선택해주세요.
        </div>
        <Input
          type="select"
          value={selectedTargetId}
          onChange={onChangeSelection}
        >
          <option value="">사용자를 선택해주세요.</option>
          {playerItems}
        </Input>
      </ModalBody>
      <ModalFooter className="itemTargetModalFooter">
        <Button className="itemApplyButton" onClick={handleApplyItemWithTarget}>
          적용하기
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ItemTargetModal;
