import { useEffect } from "react";

import { billType } from "../../containers/TradeWrapper";

type BoardProps = {
  stockBill: billType;
  tradeBill: billType;
  setTradeBill: React.Dispatch<React.SetStateAction<billType>>;
};

const TradeBoard = ({ stockBill, tradeBill, setTradeBill }: BoardProps) => {
  const { price, quantity } = stockBill;

  useEffect(() => {
    setTradeBill({ price, quantity });
  }, [setTradeBill, price, quantity]);

  return (
    <div>
      <div>현재가격</div>
      <div onClick={() => setTradeBill({ ...tradeBill, price })}>{price}</div>
      <div>보유수량</div>
      <div onClick={() => setTradeBill({ ...tradeBill, quantity })}>
        {quantity}
      </div>
    </div>
  );
};

export default TradeBoard;
