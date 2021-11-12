from typing import List, Dict, Union, Optional
from pydantic import BaseModel

# used for req in POST
class GameInfo(BaseModel):
	"gameId": str

# used for res in POST
class CorpInfo(BaseModel):
	"corpId": str
	"totalChart": Optional[List[int]] = None

# used for req in PUT
class CorpResInfo(BaseModel):
	"corpId": Dict[str, Union[int, List[int]]