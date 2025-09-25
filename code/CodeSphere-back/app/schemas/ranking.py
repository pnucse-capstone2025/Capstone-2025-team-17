from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class UserRankInfo(BaseModel):
    rank: int
    login_id: str
    total_score: int
    solved_count: int

    model_config = ConfigDict(from_attributes=True)

class RankingResponse(BaseModel):
    ranks: List[UserRankInfo]

class MyRankResponse(BaseModel):
    rank: Optional[int] = None
    login_id: str
    total_score: int
    solved_count: int