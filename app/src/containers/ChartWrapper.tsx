import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import Chart from "../components/Chart";
import { emitChartRequest } from "../modules/sockets/chart";
import { updateTime } from "../modules/time";
import { calculateNext } from "../utils/calculate";

const ChartWrapper = () => {
  const { room } = useSelector((state: RootState) => state.game);
  const { charts } = useSelector((state: RootState) => state.stock);
  const { week, day } = useSelector((state: RootState) => state.time);
  const dispatch = useDispatch();

  const handleRefresh = (e: any) => {
    const { nextWeek, nextDay } = calculateNext(week, day);
    dispatch(emitChartRequest({ room, week: nextWeek, day: nextDay }));
    dispatch(updateTime({ week: nextWeek, day: nextDay }));
  };

  return <Chart charts={charts} handleRefresh={handleRefresh} />;
};

export default ChartWrapper;
