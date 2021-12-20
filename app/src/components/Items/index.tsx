import { useState } from "react";
import { Row, Button, Col } from "reactstrap";

import { ITEM } from "../../constants/item";
import ItemTargetModal from "./ItemTargetModal";

const ItemComponent = ({
  isSelected,
  disabled,
  itemId,
  items,
  handleSelectItem,
}) => {
  return (
    <Col
      className={`itemComponent ${isSelected ? "selectedItem" : ""} ${
        disabled ? "disabled" : ""
      }`}
      id={itemId}
      onClick={handleSelectItem}
    >
      <div className="itemTitle" id={itemId}>
        {ITEM[itemId]?.NAME}
      </div>
      <div className="itemContentWrapper">
        <div className="itemContent" id={itemId}>
          {ITEM[itemId]?.CONTENT}
        </div>
        <div className="itemContent itemCooltime" id={itemId}>
          아이템 쿨타임: {disabled ? items[itemId] : ITEM[itemId]?.COOLTIME}
        </div>
      </div>
    </Col>
  );
};

const Items = ({
  items,
  handleApplyItem,
  disabled,
  players,
  corps,
  playerId,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [targetModalOpen, setTargetModalOpen] = useState<boolean>(false);

  const handleSelectedItemId = (e) => {
    if (items[e.target.id] === 0) setSelectedItemId(e.target.id);
  };

  const toggleModal = () => {
    setTargetModalOpen(!targetModalOpen);
  };

  const onClickApplyItemButton = () => {
    if (ITEM[selectedItemId]?.TARGET) {
      setTargetModalOpen(true);
    } else {
      handleApplyItem(selectedItemId);
      setSelectedItemId("");
    }
  };

  return (
    <>
      <Row className="itemsWrapper">
        {Object.keys(items).map((itemId) => (
          <ItemComponent
            key={itemId}
            itemId={itemId}
            handleSelectItem={handleSelectedItemId}
            items={items}
            disabled={!!items[itemId]}
            isSelected={selectedItemId === itemId}
          />
        ))}
      </Row>
      <Row className="itemsButtonWrapper">
        <Button
          className="itemButton"
          onClick={onClickApplyItemButton}
          disabled={disabled}
        >
          사용하기
        </Button>
      </Row>
      <ItemTargetModal
        isOpen={targetModalOpen}
        toggle={toggleModal}
        players={players}
        corps={corps}
        target={ITEM[selectedItemId]?.TARGET}
        playerId={playerId}
        handleApplyItem={handleApplyItem}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
      />
    </>
  );
};

export default Items;
