import React from "react";
import { ListGroup, ListGroupItem, Row, Col } from "reactstrap";

import { ChartState } from "../modules/stock";
import "../styles/Corporations.css";

type CorperationsProps = {
  tick: number;
  corps: ChartState[];
  onClickCorpItem: (id: string) => void;
};

const Corporations = ({ tick, corps, onClickCorpItem }: CorperationsProps) => {
  const CorporationItems = corps.map((corp: ChartState) => {
    const prevPrice = corp.totalChart.at(-1);
    const nowPrice = corp.todayChart[tick - 1];
    const rate = (nowPrice - prevPrice) / prevPrice;
    return (
      <ListGroupItem
        tag="a"
        key={corp.corpId}
        href="#"
        onClick={() => onClickCorpItem(corp.corpId)}
        action
      >
        <Row>
          <Col>{corp.corpName}</Col>
          <Col className={rate >= 0 ? "stockRateUp" : "stockRateDown"}>
            {rate}
          </Col>
          <Col>{corp.todayChart[tick - 1]}</Col>
        </Row>
      </ListGroupItem>
    );
  });
  return (
    <>
      <ListGroup>{CorporationItems}</ListGroup>
    </>
  );
};

export default Corporations;
