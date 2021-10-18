export class DayStartRequestDto {
  gameId: string;
  week: number;
  day: number;
}

export type DayChart = {
  [key: string]: number[];
};

export class DayStartResponseDto {
  dayChart: DayChart;
}
