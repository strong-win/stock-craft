import { Row, Col } from "reactstrap";

import "../styles/Items.css";

type ItemsAndTradeListTabProps = {
  selected: "tradeList" | "items";
  handleChangeSelected: (e) => void;
};

const ItemsAndTradeListTab = ({
  selected,
  handleChangeSelected,
}: ItemsAndTradeListTabProps) => {
  return (
    <Row className="itemsAndTradeListTab">
      <Col
        className={`tabButton ${selected === "items" && "selected"}`}
        id="items"
        onClick={handleChangeSelected}
      >
        아이템
      </Col>
      <Col
        className={`tabButton ${selected === "tradeList" && "selected"}`}
        id="tradeList"
        onClick={handleChangeSelected}
      >
        주문내역
      </Col>
    </Row>
  );
};

export default ItemsAndTradeListTab;
