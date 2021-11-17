import { Row, Button, Col } from "reactstrap";

import ITEMS from "../constants/item";

const ItemComponant = ({ itemId }) => {
  return (
    <Col className="itemComponant">
      <div className="itemTitle">{ITEMS[itemId]?.NAME}</div>
      <div className="itemContent">{ITEMS[itemId]?.CONTENT}</div>
    </Col>
  );
};

const Items = ({ items }) => {
  return (
    <>
      <Row className="itemsWrapper">
        {items.map((itemId) => (
          <ItemComponant itemId={itemId} />
        ))}
      </Row>
      <Row className="itemsButtonWrapper">
        <Button className="itemButton">사용하기</Button>
      </Row>
    </>
  );
};

export default Items;
