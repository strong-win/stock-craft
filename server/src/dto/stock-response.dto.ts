export type DayChart = {
  [key: string]: number[];
};

export class StockResponseDto {
  dayChart: DayChart;
}
