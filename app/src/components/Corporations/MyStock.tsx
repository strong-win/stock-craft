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
    const averagePrice = 3000; //asset.평단가

    const nowPrice = corp.todayChart[tick - 1];
    const rate = ((nowPrice - averagePrice) / averagePrice) * 100;
    const gap = nowPrice - averagePrice;
    let color = "";
    if (rate > 0) color = "red";
    else if (rate < 0) color = "blue";

    return (
      <tr className="corpItem" onClick={() => onClickCorpItem(corp.corpId)}>
        <th scope="row">{corp.corpName}</th>
        <td>{asset.totalQuantity}</td>
        <td>{averagePrice}</td>
        <td>{nowPrice}</td>
        <td className={color}>{gap ? gap : "-"}</td>
        <td className={color}>{rate ? rate.toFixed(2) : "-"}%</td>
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
