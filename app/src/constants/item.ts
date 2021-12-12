export const ITEM_TYPE = {
  individual: ["salary", "leverage"],
  institutional: ["short", "long"],
  party: ["blackout", "leading"],
  common: ["chatoff", "tradeoff", "cloaking", "dividend", "lotto", "news"],
};

export const ITEM_TARGET = {
  player: {
    name: "사용자",
  },
  corp: {
    name: "종목",
  },
  news: {
    name: "뉴스",
  },
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
    CONTENT: "하루동안 매도 시 거래 금액 두 배의 현금을 받습니다.",
    COOLTIME: 3,
  },
  short: {
    NAME: "공매도",
    IMAGE: "",
    CONTENT: "선택한 종목의 주가가 다음 날 10% 하락합니다.",
    TARGET: "corp",
    COOLTIME: 3,
  },
  long: {
    NAME: "찌라시",
    IMAGE: "",
    CONTENT: "선택한 종목의 주가가 다음 날 10% 상승합니다.",
    TARGET: "corp",
    COOLTIME: 3,
  },
  blackout: {
    NAME: "블랙아웃",
    IMAGE: "",
    CONTENT: "모든 플레이어의 채팅과 거래를 하루동안 금지시킬 수 있습니다.",
    COOLTIME: 6,
  },
  leading: {
    NAME: "리딩방",
    IMAGE: "",
    CONTENT: "내 목표주식에 대해 원하는 뉴스(호재/악재)를 전체공개합니다.",
    COOLTIME: 3,
    TARGET: "news",
  },
  chatoff: {
    NAME: "채팅밴",
    IMAGE: "",
    CONTENT: "지정 플레이어 1명의 채팅을 하루동안 금지시킬 수 있습니다.",
    COOLTIME: 5,
    TARGET: "player",
  },
  tradeoff: {
    NAME: "거래밴",
    IMAGE: "",
    CONTENT: "지정 플레이어 1명의 거래를 하루동안 금지시킬 수 있습니다.",
    COOLTIME: 5,
    TARGET: "player",
  },
  cloaking: {
    NAME: "사칭",
    IMAGE: "",
    CONTENT: "하루동안 원하는 플레이어를 사칭하여 채팅할 수 있습니다.",
    COOLTIME: 3,
    TARGET: "player",
  },
  dividend: {
    NAME: "배당",
    IMAGE: "",
    CONTENT: "현재 평가금액(주식 보유 금액)의 5%를 배당금으로 받습니다.",
    COOLTIME: 3,
  },
  lotto: {
    NAME: "로또",
    IMAGE: "",
    CONTENT: "낮은 확률로 큰 돈을 얻을 수 있습니다! 1만원 부터! 굿 럭 ~",
    COOLTIME: 3,
  },
  news: {
    NAME: "뉴스",
    IMAGE: "",
    CONTENT: "임의의 한 종목의 호재/악재 정보를 전체 공개합니다.",
    COOLTIME: 3,
  },
};
