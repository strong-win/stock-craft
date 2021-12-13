import { ROLE_TYPE } from "../../constants/role";
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

const RoleCard = ({ role, score }) => {
  const assetData = [
    {
      name: "기본 점수",
      value: Math.floor(score?.basic) || 0,
      unit: "점",
    },
    {
      name: "직업 점수",
      value: Math.floor(score?.bonus) || 0,
      unit: "점",
    },
    {
      name: "최종 점수",
      value: Math.floor(score?.basic + score?.bonus),
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
      <div className="roleNotice">점수는 하루 간격으로 업데이트 됩니다.</div>
    </div>
  );
};

export default RoleCard;
