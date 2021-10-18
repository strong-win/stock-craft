import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "..";
import Clock from "../components/Clock";
import { updateTime } from "../modules/time";
import { sendDayEnd } from "../modules/sockets/chart";
import { tradeRefresh } from "../modules/sockets/trade";
import { calculateNextTime } from "../utils/calculate";

const ClockWrapper = () => {
  const { gameId, playerId } = useSelector((state: RootState) => state.user);
  const { week, day, tick } = useSelector((state: RootState) => state.time);
  const dispatch = useDispatch();

  const [fourthTickFlag, setFourthTickFlag] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(
      () => {
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
        if (day > 0 && tickChanged < 4) {
          dispatch(
            tradeRefresh({
              gameId,
              playerId,
              week: weekChanged,
              day: dayChanged,
              tick: tickChanged,
            })
          );
        }

        /**
         * TODO
         * - 4틱이 지나 날짜가 바뀔 때 sendDayEnd 액션을 실행하도록 구현 필요
         * - 4틱이 자나 날짜가 바뀌고 5초 후 sendDayStart 액션을 실행해 dayChart 를 받아 업데이트하도록 구현 필요
         * - 4틱에서는 타이머가 20초로 설정되도록 구현 필요
         */
        // refresh todayChart
        if (tickChanged === 4 - 1) {
          setFourthTickFlag(true);
        }
        if (tickChanged === 4) {
          setTimeout(() => {
            dispatch(
              sendDayEnd({
                gameId,
                playerId,
                week: week,
                day: day,
                item: ["example"],
              })
            );
          }, 15000);

          setFourthTickFlag(false);
        }
      },
      fourthTickFlag ? 20000 : 15000
    );
    // eslint-disable-next-line
  }, [tick]);

  return <Clock week={week} day={day} tick={tick} />;
};

export default ClockWrapper;
