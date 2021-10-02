import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import Chart from "../components/Chart";
import { emitChart } from "../modules/sockets/chart";
import { calculateNext } from "../utils/calculate";

const ChartWrapper = () => {
  const { room } = useSelector((state: RootState) => state.game);
  const { week, day, dayTicks } = useSelector(
    (state: RootState) => state.stock
  );
  const dispatch = useDispatch();

  const handleRefresh = (e: any) => {
    const { nextWeek, nextDay } = calculateNext(week, day);
    dispatch(emitChart({ room, week: nextWeek, day: nextDay }));
  };

  return <Chart dayTicks={dayTicks} handleRefresh={handleRefresh} />;
};

export default ChartWrapper;
