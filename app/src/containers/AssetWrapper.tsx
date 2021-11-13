import { useSelector } from "react-redux";
import { RootState } from "..";

import Asset from "../components/Asset";

const AssetWrapper = () => {
  const { cash, assets } = useSelector((state: RootState) => state.user);
  const { corps } = useSelector((state: RootState) => state.stock);
  const { tick } = useSelector((state: RootState) => state.time);
  return <Asset cash={cash} assets={assets} corps={corps} tick={tick} />;
};

export default AssetWrapper;
