import { ROLE_TYPE } from "../../constants/role";
import { AssetState } from "../../modules/user";
import "../../styles/Chatting.css";

const AssetItem = ({ name, value, unit }) => {
  return (
    <div className="row my-4">
      <div className="col-6">{name}</div>
      <div className="col-6">
        {value} {unit}
      </div>
    </div>
  );
};

const RoleCard = ({ role, cash, assets, corps, tick }) => {
  const totalPurchaseAmount = assets
    .map((asset: AssetState) => asset.purchaseAmount)
    .reduce(
      (previousValue: number, currentValue: number) =>
        previousValue + currentValue
    );

  const currentAmounts: number[] = corps.map((corp) => {
    const nowPrice =
      corp?.todayChart[tick - 1] || corp?.totalChart?.at(-1) || 0;
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

  const assetData = [
    {
      name: "거래 이익",
      value: Math.floor(totalDiff) || 0,
      unit: "점",
    },
    {
      name: "보너스 점수",
      value: 0,
      unit: "점",
    },
    {
      name: "최종 점수",
      value: totalCurrentAmount + cash?.totalCash || 0,
      unit: "점",
    },
  ];

  const roleAssetItems = assetData.map((asset) => (
    <AssetItem name={asset.name} value={asset.value} unit={asset.unit} />
  ));

  return (
    <div className="roleCardWrapper">
      <div className="roleCardTitle">{ROLE_TYPE[role]?.NAME}</div>{" "}
      <div className="roleCardContent1">{ROLE_TYPE[role]?.CONTENT}</div>
      <div className="roleCardContent2">
        <div className="roleImageWrapper">
          <img className="roleImage" src={ROLE_TYPE[role]?.IMAGE} />
        </div>
        <div className="roleAssetWrapper">{roleAssetItems}</div>
      </div>
    </div>
  );
};

export default RoleCard;
