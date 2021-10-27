import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Clock from "../components/Clock";
import { sendGameTimeRequest } from "../modules/sockets/game";

const ClockWrapper = () => {
  const { isHost, gameId } = useSelector((state: RootState) => state.user);
  const { week, day, tick } = useSelector((state: RootState) => state.time);
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      if (isHost) dispatch(sendGameTimeRequest({ gameId }));
    }, 15000);

    /**
     * TO DO - host 가 퇴장하고 다른 guest 가 host 가 되었을 때, 연속적인 time request 필요
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return <Clock week={week} day={day} tick={tick} />;
};

export default ClockWrapper;
