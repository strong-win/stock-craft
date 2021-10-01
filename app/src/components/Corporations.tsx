import React from "react";
import { ListGroup, ListGroupItem } from "reactstrap";

type corpTimeData = {
  time: number;
  value: number;
};

type corpData = {
  id: string;
  name: string;
  data: corpTimeData[];
};

type CorperationsProps = {
  data: corpData[];
  onClickCorpItem: (id: string) => void;
};

const Corporations = ({ data, onClickCorpItem }: CorperationsProps) => {
  const CorporationItems = data.map((corp: corpData) => (
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
