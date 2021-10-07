import React from "react";
import { ListGroup, ListGroupItem } from "reactstrap";

import { chartType } from "../modules/stock";

type CorperationsProps = {
  corps: chartType[];
  onClickCorpItem: (id: string) => void;
};

const Corporations = ({ corps, onClickCorpItem }: CorperationsProps) => {
  const CorporationItems = corps.map((corp: chartType) => (
    <ListGroupItem
      tag="a"
      key={corp.corpId}
      href="#"
      onClick={() => onClickCorpItem(corp.corpId)}
      action
    >
      <div>{corp.corpName}</div>
    </ListGroupItem>
  ));
  return (
    <>
      <ListGroup>{CorporationItems}</ListGroup>
    </>
  );
};

export default Corporations;
