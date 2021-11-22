import { Table, Button } from "reactstrap";

import { ChartState } from "../../modules/stock";
import { TradeState } from "../../modules/user";

type tradeListProps = {
  trades: TradeState[];
  corps: ChartState[];
  selectedCorpId: string;
  isChartView?: boolean;
  isTitle?: boolean;
  handleCancel: (_id: string, corpId: string) => void;
};

const tradeStatusToText = {
  pending: "거래 대기",
  disposed: "거래 완료",
  cancel: "거래 취소",
};

const tradeDealToText = {
  buy: "매수",
  sell: "매도",
};

const TradeList = ({
  trades,
  corps,
  selectedCorpId,
  isChartView,
  isTitle,
  handleCancel,
}: tradeListProps) => {
  return (
    <>
      {isTitle && (
        <div className="tableTitle">
          {isChartView ? "상세" : "종합"} 주문 내역
        </div>
      )}
      <Table className="tradeTable">
        <thead>
          <tr>
            {!isChartView && <th>종목명</th>}
            <th>종류</th>
            <th>수량</th>
            <th>주문금액</th>
            <th>총금액</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {trades
            .filter((trade) => !isChartView || trade.corpId === selectedCorpId)
            .map((trade) => (
              <tr className={trade.status}>
                {!isChartView && (
                  <td>
                    {
                      corps.find((corp) => corp.corpId === trade.corpId)
                        .corpName
                    }
                  </td>
                )}
                <td className={trade.deal}>
                  {tradeDealToText[trade.deal] || trade.deal}
                </td>
                <td>{trade.quantity}</td>
                <td>{trade.price}</td>
                <td>{trade.quantity * trade.price}</td>
                <td className={`${trade.status}Text status`}>
                  {tradeStatusToText[trade.status] || trade.status}
                  {trade.status === "pending" ? (
                    <Button
                      className="cancelButton"
                      color="link"
                      onClick={() => handleCancel(trade._id, trade.corpId)}
                    >
                      &times;
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
    </>
  );
};

export default TradeList;
