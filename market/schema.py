from typing import List, Dict, Union, Optional
from pydantic import BaseModel

# used for req in POST
class GameInfo(BaseModel):
    gameId: str


# used for res in POST
class CorpInfo(BaseModel):
    corpId: str
    totalChart: Optional[List[int]] = None


# used for req in PUT
class TimeState(BaseModel):
    week: int
    day: int
    tick: int

class CorpMarketInfo(BaseModel):
    increment: int
    buyQuantity: int
    sellQuantity: int

class CorpEventInfo(BaseModel):
    gameId: str
    prevTime: TimeState
    nextTime: TimeState
    event: Dict[str, CorpMarketInfo]


# used for res in PUT
class CorpValueInfo(BaseModel):
    corpId: Dict[str, int]


class CorpResInfo(BaseModel):
    gameId: str
    stock: Dict[str, CorpValueInfo]
