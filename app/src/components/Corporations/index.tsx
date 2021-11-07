import React, { useState } from "react";
import { Table } from "reactstrap";

import { ChartState } from "../../modules/stock";
import MyStock from "./MyStock";
import Chart from "./Chart";
import "../../styles/Corporations.css";

type CorperationsProps = {
  tick: number;
  corps: ChartState[];
  onClickCorpItem: (id: string) => void;
};

const ChartTab = (props) => {
  const [activeTab, setActiveTab] = useState<string>("StockMarket");
  const { tick, assets, corps, onClickCorpItem, selectedCorpId } = props;

  const handleTabClick = (e) => {
    const tab = e.target.id;
    setActiveTab(tab);
  };

  return (
    <>
      <div className="chartTabWrapper container">
        <ul className="nav nav-pills">
          <li>
            <a
              id="StockMarket"
              className={`chartTab ${
                activeTab === "StockMarket" ? "active" : ""
              }`}
              onClick={handleTabClick}
              data-toggle="tab"
            >
              주식 시장
            </a>
          </li>
          <li>
            <a
              id="MyStock"
              className={`chartTab ${activeTab === "MyStock" ? "active" : ""}`}
              onClick={handleTabClick}
              data-toggle="tab"
            >
              주식 잔고
            </a>
          </li>
        </ul>
      </div>
      {activeTab === "StockMarket" && (
        <StockMarket
          tick={tick}
          corps={corps}
          onClickCorpItem={onClickCorpItem}
          selectedCorpId={selectedCorpId}
        />
      )}
      {activeTab === "MyStock" && (
        <MyStockMarket
          tick={tick}
          corps={corps}
          assets={assets}
          onClickCorpItem={onClickCorpItem}
          selectedCorpId={selectedCorpId}
        />
      )}
    </>
  );
};
const StockMarket = ({ tick, corps, onClickCorpItem, selectedCorpId }) => {
  return selectedCorpId ? (
    <>
      <Chart
        corp={corps.find((corp: ChartState) => corp.corpId === selectedCorpId)}
        tick={tick}
        onClickBackButton={onClickCorpItem}
      />
    </>
  ) : (
    <>
      <Corporations
        tick={tick}
        corps={corps}
        onClickCorpItem={onClickCorpItem}
      />
    </>
  );
};

const MyStockMarket = ({
  tick,
  assets,
  corps,
  onClickCorpItem,
  selectedCorpId,
}) => {
  return selectedCorpId ? (
    <>
      <Chart
        corp={corps.find((corp: ChartState) => corp.corpId === selectedCorpId)}
        tick={tick}
        averagePrice={assets.averagePrice}
        onClickBackButton={onClickCorpItem}
      />
    </>
  ) : (
    <>
      <MyStock
        tick={tick}
        assets={assets}
        corps={corps}
        onClickCorpItem={onClickCorpItem}
      />
    </>
  );
};

const Corporations = ({ tick, corps, onClickCorpItem }: CorperationsProps) => {
  const CorpItem = ({ corp }) => {
    const prevPrice = corp.totalChart.at(-1);
    const nowPrice = corp.todayChart[tick - 1];
    const rate = ((nowPrice - prevPrice) / prevPrice) * 100;
    const gap = nowPrice - prevPrice;
    let color = "";
    if (rate > 0) color = "red";
    else if (rate < 0) color = "blue";

    return (
      <tr className="corpItem" onClick={() => onClickCorpItem(corp.corpId)}>
        <th scope="row">{corp.corpName}</th>
        <td>{nowPrice ? nowPrice : "-"}</td>
        <td className={color}>{gap ? gap : "-"}</td>
        <td className={color}>{rate ? rate.toFixed(2) : "-"}%</td>
      </tr>
    );
  };

  const corpItems = corps.map((corp) => <CorpItem corp={corp} />);

  return (
    <>
      <Table hover className="corpTable">
        <thead>
          <tr>
            <th>종목명</th>
            <th>현재가격</th>
            <th>대비</th>
            <th>등락률</th>
          </tr>
        </thead>
        <tbody>{corpItems}</tbody>
      </Table>
    </>
  );
};

export default ChartTab;
