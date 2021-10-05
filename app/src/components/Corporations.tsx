import React from "react";
import { ListGroup, ListGroupItem, Button } from "reactstrap";
import { chartType } from "../modules/stock";

type CorperationsProps = {
  corps: chartType[];
  onClickCorpItem: (id: string) => void;
  handleRefresh: React.MouseEventHandler<HTMLButtonElement>;
};

const Corporations = ({
  corps,
  onClickCorpItem,
  handleRefresh,
}: CorperationsProps) => {
  const CorporationItems = corps.map((corp: chartType) => (
    <ListGroupItem
      tag="a"
      key={corp.corpId}
      href="#"
      onClick={() => onClickCorpItem(corp.corpId)}
      action
    >
      {corp.corpName}
    </ListGroupItem>
  ));
  return (
    <>
      <ListGroup>{CorporationItems}</ListGroup>
      <Button onClick={handleRefresh}>Refresh</Button>
    </>
  );
};

export default Corporations;
