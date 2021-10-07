import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Clock from "../components/Clock";
import { updateTime } from "../modules/time";
import { chartRequest } from "../modules/sockets/chart";
import { tradeRefresh } from "../modules/sockets/trade";
import { calculateNextTime } from "../utils/calculate";

const ClockWrapper = () => {
  const { room } = useSelector((state: RootState) => state.user);
  const { week, day, tick } = useSelector((state: RootState) => state.time);
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      const { weekChanged, dayChanged, tickChanged } = calculateNextTime({
        week,
        day,
        tick,
      });

      dispatch(
        updateTime({
          week: weekChanged,
          day: dayChanged,
          tick: tickChanged,
        })
      );

      // refresh trade
      dispatch(
        tradeRefresh({
          room,
          week: weekChanged,
          day: dayChanged,
          tick: tickChanged,
        })
      );

      // refresh todayChart
      if (day !== dayChanged) {
        dispatch(chartRequest({ room, week: weekChanged, day: dayChanged }));
      }
    }, 15000);
  }, [tick]);

  return <Clock week={week} day={day} tick={tick} />;
};

export default ClockWrapper;
