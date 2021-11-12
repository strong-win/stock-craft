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
class CorpMarketInfo(BaseModel):
	increment: int
	buyingVolume: int
	sellingVolune: int

class CorpEventInfo(BaseModel):
	gameId: str
	event: Dict[str, CorpMarketInfo]

# used for res in PUT
class CorpValueInfo(BaseModel):
	corpId: Dict[str, Union[int, List[int]]]

class CorpResInfo(BaseModel):
	gameId: str
	stock: Dict[str, CorpValueInfo]
