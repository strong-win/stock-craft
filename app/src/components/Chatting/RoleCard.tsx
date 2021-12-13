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

const RoleCard = ({ role, score, corps }) => {
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

  const targetCorp = corps.find((corp) => corp.target !== 0);

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
        <div className="roleAssetWrapper">
          {roleAssetItems}
          {role === "party" && (
            <div className="partyTarget">
              <AssetItem
                name="타겟 종목"
                value={targetCorp?.corpName}
                unit=""
              />
              <AssetItem
                name="타겟 가격"
                value={targetCorp?.target}
                unit="원"
              />
            </div>
          )}
        </div>
      </div>
      <div className="roleNotice">점수는 하루 간격으로 업데이트 됩니다.</div>
    </div>
  );
};

export default RoleCard;
