import { TimeState } from "../modules/time";

export const calculateNextDay = (week: number, day: number) => {
  return day === 5
    ? { nextWeek: week + 1, nextDay: 0 }
    : { nextWeek: week, nextDay: day + 1 };
};

export const calculateNextTime = ({ week, day, tick }: TimeState) => {
  const tickChanged = tick + 1;
  const dayChanged = tickChanged === 5 ? day + 1 : day;
  const weekChanged = dayChanged === 6 ? week + 1 : week;

  return {
    weekChanged,
    dayChanged: dayChanged % 6,
    tickChanged: (tick % 4) + 1,
  };
};
