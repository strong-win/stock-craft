import { useState } from "react";
import { Row, Button, Col } from "reactstrap";

import { ITEM } from "../constants/item";

const ItemComponent = ({ isSelected, disabled, itemId, handleSelectItem }) => {
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
      <div className="itemContent" id={itemId}>
        {ITEM[itemId]?.CONTENT}
      </div>
    </Col>
  );
};

const Items = ({ items, handleApplyItem }) => {
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const handleSelectedItemId = (e) => {
    if (items[e.target.id] === 0) setSelectedItemId(e.target.id);
  };

  return (
    <>
      <Row className="itemsWrapper">
        {Object.keys(items).map((itemId) => (
          <ItemComponent
            key={itemId}
            itemId={itemId}
            handleSelectItem={handleSelectedItemId}
            disabled={!!items[itemId]}
            isSelected={selectedItemId === itemId}
          />
        ))}
      </Row>
      <Row className="itemsButtonWrapper">
        <Button
          className="itemButton"
          onClick={() => handleApplyItem(selectedItemId)}
        >
          사용하기
        </Button>
      </Row>
    </>
  );
};

export default Items;
