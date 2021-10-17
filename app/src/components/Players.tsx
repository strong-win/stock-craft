import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { playerType } from "../modules/user";
import "../styles/Players.css";

type PlayersProps = {
  room: string;
  players: playerType[];
};

const RoomCode = ({ room }) => (
  <DropdownToggle caret className="RoomCode">
    <p className="label">room</p>
    <p className="code">{room}</p>
  </DropdownToggle>
);

const Players = ({ room, players }: PlayersProps) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const toggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const onMouseEnter = () => {
    setDropdownOpen(true);
  };

  const onMouseLeave = () => {
    setDropdownOpen(false);
  };

  const playerComponent = players.map(({ clientId, name }, index) => (
    <DropdownItem key={index}>
      {name}({clientId})
    </DropdownItem>
  ));

  return (
    <Dropdown
      direction="left"
      onMouseOver={onMouseEnter}
      onMouseLeave={onMouseLeave}
      isOpen={dropdownOpen}
      toggle={toggle}
    >
      <RoomCode room={room} />
      <DropdownMenu>{playerComponent}</DropdownMenu>
    </Dropdown>
  );
};

export default Players;
