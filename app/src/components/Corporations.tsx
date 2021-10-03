import React from "react";
import { ListGroup, ListGroupItem } from "reactstrap";

export type chartDataType = {
  time: number;
  value: number;
};

type corpsType = {
  id: string;
  name: string;
  chartData: chartDataType[];
};

type CorperationsProps = {
  corps: corpsType[];
  onClickCorpItem: (id: string) => void;
};

const Corporations = ({ corps, onClickCorpItem }: CorperationsProps) => {
  const CorporationItems = corps.map((corp: corpsType) => (
    <ListGroupItem
      tag="a"
      key={corp.id}
      href="#"
      onClick={() => onClickCorpItem(corp.id)}
      action
    >
      {corp.name}
    </ListGroupItem>
  ));
  return <ListGroup>{CorporationItems}</ListGroup>;
};

export default Corporations;
