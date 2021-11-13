import { Row, Col } from "reactstrap";

import "../styles/Asset.css";

const AssetItem = ({ name, value, unit, color = false }) => {
  return (
    <Row className="assetItemRow">
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
  const totalPurchaseAmout = assets.reduce(
    (previousValue, currentValue) =>
      previousValue.purchaseAmount + currentValue.purchaseAmount
  );

  const currentAmounts = corps.map((corp) => {
    const nowPrice = corp.todayChart[tick - 1] || corp.totalChart.at(-1) || 0;
    return (
      nowPrice *
      assets.find((asset) => asset.corpId == corp.corpId)?.totalQuantity
    );
  });

  const totalCurrentAmout = currentAmounts.reduce(
    (previousValue, currentValue) => previousValue + currentValue
  );

  const AssetData = [
    {
      name: "총 자산",
      value: cash?.totalCash + totalCurrentAmout,
      unit: "원",
    },
    {
      name: "총 예수금",
      value: cash?.totalCash,
      unit: "원",
    },
    {
      name: "매입금액",
      value: totalPurchaseAmout || 0,
      unit: "원",
    },
    {
      name: "평가금액",
      value: totalCurrentAmout,
      unit: "원",
    },
    {
      name: "평가손익",
      value: totalCurrentAmout - totalPurchaseAmout || 0,
      unit: "원",
    },
    {
      name: "평균 수익률",
      value: (totalCurrentAmout - totalPurchaseAmout) / totalPurchaseAmout || 0,
      unit: "%",
    },
  ];

  const AssetItemsComponent = AssetData.map((asset) => (
    <AssetItem name={asset.name} value={asset.value} unit={asset.unit} />
  ));
  return (
    <>
      <div className="assetTitle">보유 자산</div>
      {AssetItemsComponent}
    </>
  );
};

export default Asset;
