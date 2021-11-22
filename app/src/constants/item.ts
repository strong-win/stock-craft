export const ITEM_TYPE = {
  individual: ["salary", "leverage"],
  institutional: ["short", "long"],
  party: ["blackout", "leading"],
  common: ["chatoff", "tradeoff", "cloaking", "dividend", "lotto", "news"],
};

export const ITEM = {
  //itemId to attribute
  salary: {
    NAME: "월급날",
    IMAGE: "",
    CONTENT: "오늘은 월급날! 현재 보유 현금의 5%를 월급으로 받습니다.",
    COOLTIME: 3,
  },
  leverage: {
    NAME: "레버리지",
    IMAGE: "",
    CONTENT: "레버리지 설명 예시입니다.",
    COOLTIME: 3,
  },
  short: { NAME: "공매도", IMAGE: "", CONTENT: "공매도 설명 예시입니다." },
  long: { NAME: "찌라시", IMAGE: "", CONTENT: "찌라시 설명 예시입니다." },
  blackout: {
    NAME: "블랙아웃",
    IMAGE: "",
    CONTENT: "블랙아웃 설명 예시입니다.",
    COOLTIME: 3,
  },
  leading: {
    NAME: "리딩방",
    IMAGE: "",
    CONTENT: "리딩방 설명 예시입니다.",
    COOLTIME: 3,
  },
  chatoff: {
    NAME: "채팅밴",
    IMAGE: "",
    CONTENT: "지정 플레이어 1명의 채팅을 하루동안 금지시킬 수 있습니다.",
    COOLTIME: 5,
  },
  tradeoff: {
    NAME: "거래밴",
    IMAGE: "",
    CONTENT: "지정 플레이어 1명의 거래를 하루동안 금지시킬 수 있습니다.",
    COOLTIME: 5,
  },
  cloaking: {
    NAME: "사칭",
    IMAGE: "",
    CONTENT: "사칭 설명 예시입니다.",
    COOLTIME: 3,
  },
  dividend: {
    NAME: "배당",
    IMAGE: "",
    CONTENT: "현재 평가금액(주식 보유 금액)의 5%를 배당금으로 받습니다. ",
    COOLTIME: 3,
  },
  lotto: {
    NAME: "로또",
    IMAGE: "",
    CONTENT: "로또 설명 예시입니다.",
    COOLTIME: 3,
  },
  news: {
    NAME: "뉴스",
    IMAGE: "",
    CONTENT: "뉴스 설명 예시입니다.",
    COOLTIME: 3,
  },
};
