export const calculateNext = (week: number, day: number) => {
  return day === 5
    ? { nextWeek: week + 1, nextDay: 0 }
    : { nextWeek: week, nextDay: day + 1 };
};
