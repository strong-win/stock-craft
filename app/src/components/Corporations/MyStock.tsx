import { Table } from "reactstrap";

import { ChartState } from "../../modules/stock";
import { AssetState } from "../../modules/user";
import "../../styles/Corporations.css";

type MyStockProps = {
  tick: number;
  corps: ChartState[];
  assets: AssetState[];
  onClickCorpItem: (id: string) => void;
};

const MyStock = ({ tick, corps, assets, onClickCorpItem }: MyStockProps) => {
  const CorpItem = ({ corp }) => {
    const asset = assets.find((asset) => asset.corpId === corp.corpId);
    const averagePrice: number =
      asset.purchaseAmount / asset.totalQuantity || 0;
    const nowPrice = corp.todayChart[tick - 1];
    const rate = asset.totalQuantity
      ? ((nowPrice - averagePrice) / averagePrice) * 100
      : 0;
    const gap = asset.totalQuantity ? nowPrice - averagePrice : 0;
    let color = "";
    if (rate > 0) color = "red";
    else if (rate < 0) color = "blue";

    return (
      <tr className="corpItem" onClick={() => onClickCorpItem(corp.corpId)}>
        <th scope="row">{corp.corpName}</th>
        <td>{asset.totalQuantity}</td>
        <td>{averagePrice ? Math.floor(averagePrice) : "-"}</td>
        <td>{nowPrice}</td>
        <td className={color}>{gap ? Math.floor(gap) : "-"}</td>
        <td className={color}>{rate ? Math.floor(rate) : "-"}%</td>
      </tr>
    );
  };

  const corpItems = corps.map((corp) => <CorpItem corp={corp} />);

  return (
    <>
      <Table hover className="corpTable">
        <thead>
          <tr>
            <th>종목명</th>
            <th>보유량</th>
            <th>평단가</th>
            <th>현재가격</th>
            <th>이익</th>
            <th>수익률</th>
          </tr>
        </thead>
        <tbody>{corpItems}</tbody>
      </Table>
    </>
  );
};

export default MyStock;
