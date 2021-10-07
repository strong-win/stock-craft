import { billType } from "../../containers/TradeWrapper";
import "../../styles/Trade.css";

type InputProps = {
  tradeBill: billType;
  setTradeBill: React.Dispatch<React.SetStateAction<billType>>;
};

const TradeInput = ({ tradeBill, setTradeBill }: InputProps) => {
  const { price, quantity }: billType = tradeBill;

  const onPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price: number = parseInt(e.target.value);
    setTradeBill({ ...tradeBill, price });
  };

  const onQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity: number = parseInt(e.target.value);
    setTradeBill({ ...tradeBill, quantity });
  };

  return (
    <div className="input">
      <div>거래가</div>
      <input
        name="price"
        placeholder="거래가"
        type="number"
        value={price}
        onChange={onPriceChange}
      />
      <div>거래수량</div>
      <input
        name="quantity"
        placeholder="거래수량"
        type="number"
        value={quantity}
        onChange={onQuantityChange}
      />
    </div>
  );
};

export default TradeInput;
