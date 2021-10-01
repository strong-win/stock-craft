import Board from "./Board";
import Button from "./Button";
import Input from "./Input";
import "../../styles/Trade.css";

type TradeProps = {
  stockPrice: number;
  stockQuantity: number;
  inputPrice: number;
  inputQuantity: number;
  setInputPrice: React.Dispatch<React.SetStateAction<number>>;
  setInputQuantity: React.Dispatch<React.SetStateAction<number>>;
};

const Trade = ({
  stockPrice,
  stockQuantity,
  inputPrice,
  inputQuantity,
  setInputPrice,
  setInputQuantity,
}: TradeProps) => {
  return (
    <>
      <h1>Input Container</h1>
      <div className="trade">
        <Board
          stockPrice={stockPrice}
          stockQuantity={stockQuantity}
          setInputPrice={setInputPrice}
          setInputQuantity={setInputQuantity}
        />
        <Input
          inputPrice={inputPrice}
          inputQuantity={inputQuantity}
          setInputPrice={setInputPrice}
          setInputQuantity={setInputQuantity}
        />
        <Button />
      </div>
    </>
  );
};

export default Trade;
