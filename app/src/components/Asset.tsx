import { Row, Col } from "reactstrap";

import { CashState, AssetState } from "../modules/user";
import { ChartState } from "../modules/stock";
import "../styles/Asset.css";

type AssetItemType = {
  name: string;
  value: number;
  unit: string;
  color?: boolean;
};

// type AssetPropsType = {
//   cash: CashState;
//   assets: AssetState[];
//   corps: ChartState[];
//   tick: number;
// };

const AssetItem = ({ name, value, unit, color = false }: AssetItemType) => {
  return (
    <Row className="assetItemRow my-2">
      <Col md="3" className="assetKey">
        {name}
      </Col>
      <Col md="3" className="assetValue">
        {value}
      </Col>
      <Col md="1">{unit}</Col>
    </Row>
  );
};

const Asset = ({ cash, assets, corps, tick }) => {
  const totalPurchaseAmount = assets
    .map((asset: AssetState) => asset.purchaseAmount)
    .reduce(
      (previousValue: number, currentValue: number) =>
        previousValue + currentValue
    );

  const currentAmounts: number[] = corps.map((corp) => {
    const nowPrice = corp.todayChart[tick - 1] || corp.totalChart?.at(-1) || 0;
    return (
      nowPrice *
      assets.find((asset: AssetState) => asset.corpId === corp.corpId)
        ?.totalQuantity
    );
  });

  const totalCurrentAmount = currentAmounts.reduce(
    (previousValue: number, currentValue: number) =>
      previousValue + currentValue
  );

  const totalDiff = totalCurrentAmount - totalPurchaseAmount;

  const AssetData = [
    {
      name: "총 자산",
      value: cash?.totalCash + totalCurrentAmount,
      unit: "원",
    },
    {
      name: "총 예수금",
      value: cash?.totalCash,
      unit: "원",
    },
    {
      name: "매입금액",
      value: Math.floor(totalPurchaseAmount) || 0,
      unit: "원",
    },
    {
      name: "평가금액",
      value: totalCurrentAmount,
      unit: "원",
    },
    {
      name: "평가손익",
      value: Math.floor(totalDiff) || 0,
      unit: "원",
    },
    {
      name: "평균 수익률",
      value: totalPurchaseAmount
        ? Math.floor((totalDiff / totalPurchaseAmount) * 100)
        : 0,
      unit: "%",
    },
  ];

  const AssetItemsComponent = AssetData.map((asset) => (
    <AssetItem name={asset.name} value={asset.value} unit={asset.unit} />
  ));
  return (
    <div className="assetWrapper">
      <div className="assetTitle">보유 자산</div>
      {AssetItemsComponent}
    </div>
  );
};

export default Asset;
