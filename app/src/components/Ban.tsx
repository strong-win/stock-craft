import { BiLock } from "react-icons/bi";

import "../styles/Ban.css";

const Ban = ({ disabled }) => {
  return disabled ? (
    <div className="Ban">
      <BiLock />
    </div>
  ) : null;
};

export default Ban;
