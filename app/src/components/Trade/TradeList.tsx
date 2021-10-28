import { ChartState } from "../../modules/stock";
import { TradeState } from "../../modules/user";

type tradeListProps = {
  trades: TradeState[];
  corps: ChartState[];
  selectedCorpId: string;
  handleCancel: (_id: string, corpId: string) => void;
};

const TradeList = ({
  trades,
  corps,
  selectedCorpId,
  handleCancel,
}: tradeListProps) => {
  return (
    <>
      <table style={{ width: "50vh" }}>
        <thead>
          <tr>
            <th>종목명</th>
            <th>가격</th>
            <th>수량</th>
            <th>매수/매도</th>
            <th>취소</th>
          </tr>
        </thead>
        <tbody>
          {trades
            .filter((trade) => trade.corpId === selectedCorpId)
            .map((trade) => (
              <tr
                style={{
                  backgroundColor:
                    trade.status === "pending"
                      ? "#a5d8ff"
                      : trade.status === "disposed"
                      ? "#b2f2bb"
                      : "#ffc9c9",
                }}
              >
                <td>
                  {corps.find((corp) => corp.corpId === trade.corpId).corpName}
                </td>
                <td>{trade.price}</td>
                <td>{trade.quantity}</td>
                <td
                  style={{
                    color: trade.deal === "buy" ? "red" : "blue",
                  }}
                >
                  {trade.deal}
                </td>
                {trade.status === "pending" ? (
                  <td>
                    <button
                      onClick={() => handleCancel(trade._id, trade.corpId)}
                    >
                      cancel
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
};

export default TradeList;
