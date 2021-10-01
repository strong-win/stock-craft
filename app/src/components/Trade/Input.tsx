import "../../styles/Trade.css";

type InputProps = {
  inputPrice: number;
  inputQuantity: number;
  setInputPrice: React.Dispatch<React.SetStateAction<number>>;
  setInputQuantity: React.Dispatch<React.SetStateAction<number>>;
};

const Input = ({
  inputPrice,
  inputQuantity,
  setInputPrice,
  setInputQuantity,
}: InputProps) => {
  return (
    <div className="input">
      <div>거래가</div>
      <input
        name="price"
        placeholder="거래가"
        type="number"
        value={inputPrice}
        onChange={(e) => setInputPrice(parseInt(e.target.value))}
      />
      <div>거래수량</div>
      <input
        name="quantity"
        placeholder="거래수량"
        type="number"
        value={inputQuantity}
        onChange={(e) => setInputQuantity(parseInt(e.target.value))}
      />
    </div>
  );
};

export default Input;
