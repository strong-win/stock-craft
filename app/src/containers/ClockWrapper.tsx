import React, { useEffect, useState } from "react";

import Clock from "../components/Clock";

const ClockWrapper = () => {
  const [week, setWeek] = useState<number>(1);
  const [day, setDay] = useState<number>(1);
  const [tick, setTick] = useState<number>(1);

  useEffect(() => {
    setTimeout(() => {
      if (tick < 4) {
        setTick(tick + 1);
      } else {
        setTick(1);
        if (day < 6) {
          setDay(day + 1);
        } else {
          setDay(1);
          setWeek(week + 1);
        }
      }
    }, 15000);
  }, [tick]);

  return <Clock week={week} day={day} tick={tick} />;
};

export default ClockWrapper;
