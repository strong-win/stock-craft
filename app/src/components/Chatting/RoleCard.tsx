import { ROLE_TYPE } from "../../constants/role";
import "../../styles/Chatting.css";

const RoleCard = ({ role }) => {
  return (
    <div className="roleCardWrapper">
      <div className="roleCardTitle">{ROLE_TYPE[role]?.NAME}</div>{" "}
      <div className="roleCardContent1">{ROLE_TYPE[role]?.CONTENT}</div>
      <div className="roleCardContent2">
        <div className="roleImageWrapper">
          <img className="roleImage" src={ROLE_TYPE[role]?.IMAGE} />
        </div>
        <div className="roleAssetWrapper">
          <div>거래이익</div>
          <div>보너스 점수</div>
          <div className="totalScore">최종 점수</div>
        </div>
      </div>
    </div>
  );
};

export default RoleCard;
