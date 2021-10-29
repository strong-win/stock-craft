DATA_PATH = "./full_data_0929"
START_DATE = "2000-01-01"
END_DATE = "2021-09-17"

TICKER_NAME = {
    "005930": "삼성전자",
    "000660": "SK하이닉스",
    "035420": "NAVER",
    "207940": "삼성바이오로직스",
    "051910": "LG화학",
    "035720": "카카오",
    "006400": "삼성SDI",
    "005380": "현대차",
    "068270": "셀트리온",
    "323410": "카카오뱅크",
    "000270": "기아",
    "005490": "POSCO",
    "096770": "SK이노베이션",
    "259960": "크래프톤",
    "012330": "현대모비스",
    "017670": "SK텔레콤",
    "028260": "삼성물산",
    "105560": "KB금융",
    "066570": "LG전자",
    "302440": "SK바이오사이언스",
    "051900": "LG생활건강",
    "055550": "신한지주",
    "034730": "SK",
    "361610": "SK아이이테크놀로지",
    "015760": "한국전력",
    "011200": "HMM",
    "032830": "삼성생명",
    "003550": "LG",
    "003670": "포스코케미칼",
    "086790": "하나금융지주",
    "009150": "삼성전기",
    "010950": "S-Oil",
    "036570": "엔씨소프트",
    "018260": "삼성에스디에스",
    "003490": "대한항공",
    "352820": "하이브",
    "033780": "KT&G",
    "000810": "삼성화재",
    "034020": "두산중공업",
    "090430": "아모레퍼시픽",
    "251270": "넷마블",
    "010130": "고려아연",
    "011170": "롯데케미칼",
    "030200": "KT",
    "009830": "한화솔루션",
    "316140": "우리금융지주",
    "018880": "한온시스템",
    "326030": "SK바이오팜",
    "024110": "기업은행",
    "011790": "SKC",
    "009540": "한국조선해양",
    "034220": "LG디스플레이",
    "032640": "LG유플러스",
    "004020": "현대제철",
    "086280": "현대글로비스",
    "097950": "CJ제일제당",
    "035250": "강원랜드",
    "011780": "금호석유",
    "000720": "현대건설",
    "006800": "미래에셋증권",
    "021240": "코웨이",
    "161390": "한국타이어앤테크놀로지",
    "028050": "삼성엔지니어링",
    "267250": "현대중공업지주",
    "011070": "LG이노텍",
    "020150": "일진머티리얼즈",
    "139480": "이마트",
    "071050": "한국금융지주",
    "271560": "오리온",
    "005830": "DB손해보험",
    "036460": "한국가스공사",
    "016360": "삼성증권",
    "078930": "GS",
    "008930": "한미사이언스",
    "002790": "아모레G",
    "000100": "유한양행",
    "180640": "한진칼",
    "241560": "두산밥캣",
    "003410": "쌍용C&E",
    "028670": "팬오션",
    "014680": "한솔케미칼",
    "029780": "삼성카드",
    "002380": "KCC",
    "010140": "삼성중공업",
    "010060": "OCI",
    "006280": "녹십자",
    "298050": "효성첨단소재",
    "000120": "CJ대한통운",
    "006360": "GS건설",
    "005940": "NH투자증권",
    "004990": "롯데지주",
    "336260": "두산퓨얼셀",
    "008770": "호텔신라",
    "008560": "메리츠증권",
    "007070": "GS리테일",
    "272210": "한화시스템",
    "285130": "SK케미칼",
    "128940": "한미약품",
    "047810": "한국항공우주",
    "112610": "씨에스윈드",
    "012750": "에스원",
    "282330": "BGF리테일",
    "019170": "신풍제약",
    "120110": "코오롱인더",
    "088350": "한화생명",
    "047050": "포스코인터내셔널",
    "138930": "BNK금융지주",
    "298020": "효성티앤씨",
    "023530": "롯데쇼핑",
    "026960": "동서",
    "009240": "한샘",
    "042660": "대우조선해양",
    "047040": "대우건설",
    "001040": "CJ",
    "039490": "키움증권",
    "204320": "만도",
    "010620": "현대미포조선",
    "004170": "신세계",
    "064350": "현대로템",
    "375500": "DL이앤씨",
    "012450": "한화에어로스페이스",
    "030000": "제일기획",
    "004800": "효성",
    "000880": "한화",
    "004000": "롯데정밀화학",
    "081660": "휠라홀딩스",
    "000080": "하이트진로",
    "001450": "현대해상",
    "000990": "DB하이텍",
    "011210": "현대위아",
    "006260": "LS",
    "001440": "대한전선",
    "020560": "아시아나항공",
    "017800": "현대엘리베이",
    "052690": "한전기술",
    "069960": "현대백화점",
    "010120": "LS ELECTRIC",
    "111770": "영원무역",
    "003090": "대웅",
    "093370": "후성",
    "294870": "HDC현대산업개발",
    "014820": "동원시스템즈",
    "051600": "한전KPS",
    "007310": "오뚜기",
    "001230": "동국제강",
    "004370": "농심",
    "069620": "대웅제약",
    "192820": "코스맥스",
    "032350": "롯데관광개발",
    "073240": "금호타이어",
    "000150": "두산",
    "010780": "아이에스동서",
    "000240": "한국앤컴퍼니",
    "003000": "부광약품",
    "005250": "녹십자홀딩스",
    "006650": "대한유화",
    "000210": "DL",
    "185750": "종근당",
    "016380": "KG동부제철",
    "031430": "신세계인터내셔날",
    "007700": "F&F홀딩스",
    "001740": "SK네트웍스",
    "003240": "태광산업",
    "005300": "롯데칠성",
    "001120": "LX인터내셔널",
    "192080": "더블유게임즈",
    "214320": "이노션",
    "013890": "지누스",
    "069260": "휴켐스",
    "009420": "한올바이오파마",
    "079550": "LIG넥스원",
    "000670": "영풍",
    "003850": "보령제약",
    "004490": "세방전지",
    "079160": "CJ CGV",
    "000070": "삼양홀딩스",
    "001800": "오리온홀딩스",
    "003520": "영진약품",
    "005440": "현대그린푸드",
    "006120": "SK디스커버리",
    "020000": "한섬",
    "103140": "풍산",
    "105630": "한세실업",
    "114090": "GKL",
    "161890": "한국콜마",
    "241590": "화승엔터프라이즈",
    "284740": "쿠쿠홈시스",
    "001680": "대상",
    "002350": "넥센타이어",
    "049770": "동원F&B",
    "192400": "쿠쿠홀딩스",
    "006040": "동원산업",
    "383800": "LX홀딩스",
    "057050": "현대홈쇼핑",
    "064960": "SNT모티브",
    "071840": "롯데하이마트",
    "108670": "LX하우시스",
    "007570": "일양약품",
    "003230": "삼양식품",
}

KOSPI_200 = [*TICKER_NAME]
