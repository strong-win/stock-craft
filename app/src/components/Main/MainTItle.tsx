import "../../styles/Main.css";

type MainTitleProps = {
  name: string;
  onChangeName: (e: any) => void;
};

const MainTitle = ({ name, onChangeName }: MainTitleProps) => {
  return (
    <div className="titleOuterContainer">
      <div className="titleInnerContainer">
        <h1>STOCKCRAFT</h1>
        <input
          className="titleInput"
          placeholder="닉네임을 입력하세요"
          onChange={onChangeName}
          value={name}
        />
      </div>
    </div>
  );
};

export default MainTitle;
