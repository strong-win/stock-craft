import React from "react";

import Clock from "../components/Clock";

const mockData = {
  week: 1,
  day: 2,
  tick: 3,
};

const ClockWrapper = () => {
  return <Clock week={mockData.week} day={mockData.day} tick={mockData.tick} />;
};

export default ClockWrapper;
