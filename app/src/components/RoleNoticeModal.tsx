import { useEffect } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { ROLE_TYPE } from "../constants/role";

import "../styles/RoleNoticeModal.css";

const RoleNoticeModal = ({ isShowRoleModal, setIsShowRoleModal, role }) => {
  const toggle = () => {
    setIsShowRoleModal(false);
  };
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
      </ModalBody>
    </Modal>
  );
};

export default RoleNoticeModal;
