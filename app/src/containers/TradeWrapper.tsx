import { useEffect, useState } from "react";
import Trade from "../components/Trade";

const TradeWrapper = () => {
  // redux state
  const stockPrice = 100_000;
  const stockQuantity = 100;

  // useState
  const [inputPrice, setInputPrice] = useState<number>(stockPrice);
  const [inputQuantity, setInputQuantity] = useState<number>(stockQuantity);

  useEffect(() => {
    setInputPrice(stockPrice);
    setInputQuantity(stockQuantity);
  }, [stockPrice, stockQuantity]);

  return (
    <Trade
      stockPrice={stockPrice}
      stockQuantity={stockQuantity}
      inputPrice={inputPrice}
      inputQuantity={inputQuantity}
      setInputPrice={setInputPrice}
      setInputQuantity={setInputQuantity}
    />
  );
};

export default TradeWrapper;
