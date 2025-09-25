from pydantic import BaseModel
from datetime import datetime
from typing import List

class HintResponse(BaseModel):
    real_pid: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class HintRequest(BaseModel):
    real_pid: int
    user_code: str
    language: str

class AllHintsResponse(BaseModel):
    """힌트 요청에 대한 최종 응답 모델"""
    total_hints: int
    hints: List[HintResponse]