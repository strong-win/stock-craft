import { useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { ITEM, ITEM_TARGET } from "../../constants/item";
import "../../styles/Items.css";

const news = [
  {
    newsId: "good",
    newsName: "호재",
  },
  {
    newsId: "bad",
    newsName: "악재",
  },
];
const ItemTargetModal = ({
  toggle,
  isOpen,
  target,
  players = [],
  corps = [],
  playerId,
  handleApplyItem,
  selectedItemId,
  setSelectedItemId,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");

  const optionItems = {
    player: players.map((player) => {
      if (player.playerId !== playerId) {
        return <option value={player.playerId}>{player.name}</option>;
      }
    }),
    corp: corps.map((corp) => (
      <option value={corp.corpId}>{corp.corpName}</option>
    )),
    news: news.map((newsItem) => (
      <option value={newsItem.newsId}>{newsItem.newsName}</option>
    )),
  };

  const onChangeSelection = (e: any) => {
    setSelectedTargetId(e.target.value);
  };

  const handleApplyItemWithTarget = () => {
    if (selectedTargetId == "") {
      toast.error(`${ITEM_TARGET[target]?.name || "타겟"}을/를 선택해주세요!`);
    } else {
      handleApplyItem(selectedItemId, selectedTargetId);
      toggle();
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
          {ITEM[selectedItemId]?.NAME} 아이템을 적용할{" "}
          {ITEM_TARGET[target]?.name || "타겟"}을/를 선택해주세요.
        </div>
        <Input
          type="select"
          value={selectedTargetId}
          onChange={onChangeSelection}
        >
          <option value="">
            {ITEM_TARGET[target]?.name || "타겟"}을/를 선택해주세요.
          </option>
          {optionItems[target]}
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
