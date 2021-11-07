export type DayChart = {
  [key: string]: number[];
};

export class DayStartResponseDto {
  dayChart: DayChart;
}
