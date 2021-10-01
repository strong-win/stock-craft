type BoardProps = {
  stockPrice: number;
  stockQuantity: number;
  setInputPrice: React.Dispatch<React.SetStateAction<number>>;
  setInputQuantity: React.Dispatch<React.SetStateAction<number>>;
};

const Board = ({
  stockPrice,
  stockQuantity,
  setInputPrice,
  setInputQuantity,
}: BoardProps) => {
  return (
    <div>
      <div>현재가격</div>
      <div onClick={() => setInputPrice(stockPrice)}>{stockPrice}</div>
      <div>보유수량</div>
      <div onClick={() => setInputQuantity(stockQuantity)}>{stockQuantity}</div>
    </div>
  );
};

export default Board;
