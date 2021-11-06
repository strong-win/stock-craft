import React from "react";
import { Table, ListGroup, ListGroupItem, Row, Col } from "reactstrap";

import { ChartState } from "../../modules/stock";
import "../../styles/Corporations.css";

type CorperationsProps = {
  tick: number;
  corps: ChartState[];
  onClickCorpItem: (id: string) => void;
};

const Corporations = ({ tick, corps, onClickCorpItem }: CorperationsProps) => {
  const CorpItem = ({ corp }) => {
    const prevPrice = corp.totalChart.at(-1);
    const nowPrice = corp.todayChart[tick - 1];
    const rate = ((nowPrice - prevPrice) / prevPrice) * 100;
    const gap = nowPrice - prevPrice;
    let color = "";
    if (rate > 0) color = "red";
    else if (rate < 0) color = "blue";

    return (
      <tr className="corpItem" onClick={() => onClickCorpItem(corp.corpId)}>
        <th scope="row">{corp.corpName}</th>
        <td>{nowPrice ? nowPrice : "-"}</td>
        <td className={color}>{gap ? gap : "-"}</td>
        <td className={color}>{rate ? rate.toFixed(2) : "-"}%</td>
      </tr>
    );
  };

  const corpItems = corps.map((corp) => <CorpItem corp={corp} />);
  const CorporationItems = corps.map((corp: ChartState) => {
    const prevPrice = corp.totalChart.at(-1);
    const nowPrice = corp.todayChart[tick - 1];
    const rate = ((nowPrice - prevPrice) / prevPrice) * 100;
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
            {rate}%
          </Col>
          <Col>{corp.todayChart[tick - 1]}</Col>
        </Row>
      </ListGroupItem>
    );
  });
  return (
    <>
      <Table hover className="corpTable">
        <thead>
          <tr>
            <th>종목명</th>
            <th>현재가격</th>
            <th>대비</th>
            <th>등락률</th>
          </tr>
        </thead>
        <tbody>{corpItems}</tbody>
      </Table>
    </>
  );
};

export default Corporations;
