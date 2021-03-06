import { billType } from "../../containers/TradeWrapper";
import { FormGroup, Label, Col, Input } from "reactstrap";
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
    <div className="tradeInputWrapper">
      <FormGroup className="tradeInputGroup">
        <Label for="price" className="col-md-2">
          가격
        </Label>
        <Input
          name="price"
          id="price"
          placeholder="거래가"
          type="number"
          min={0}
          value={price}
          onChange={onPriceChange}
        />
      </FormGroup>
      <FormGroup className="tradeInputGroup">
        <Label for="quantity" className="col-md-2">
          수량
        </Label>
        <Input
          name="quantity"
          id="quantity"
          placeholder="거래수량"
          value={quantity}
          onChange={onQuantityChange}
          min={1}
          type="number"
          step="1"
        />
      </FormGroup>
    </div>
  );
};

export default TradeInput;
