import { useEffect } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { ROLE_TYPE } from "../constants/role";

import "../styles/RoleNoticeModal.css";

const RoleNoticeModal = ({
  isShowRoleModal,
  setIsShowRoleModal,
  role,
  corps,
}) => {
  const toggle = () => {
    setIsShowRoleModal(false);
  };

  const targetCorp = corps.find((corp) => corp.target !== 0);

  return (
    <Modal
      className="roleNoticeModal"
      size="lg"
      isOpen={isShowRoleModal}
      toggle={toggle}
    >
      <ModalHeader
        className="roleNoticeModalHeader"
        toggle={toggle}
      ></ModalHeader>
      <ModalBody className="roleNoticeModalBody">
        <div className="noticeTitle">
          당신은 <b>{ROLE_TYPE[role]?.NAME}</b>입니다
        </div>
        <div>{ROLE_TYPE[role]?.CONTENT}</div>
        {role === "party" && (
          <div className="red">
            타겟 종목: {targetCorp?.corpName} / 타겟 가격: {targetCorp?.target}{" "}
            원
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default RoleNoticeModal;
