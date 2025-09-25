from pydantic import BaseModel
from typing import Optional

class TempSaveRequest(BaseModel):
    real_pid: int
    code: str
    language: str

class TempSaveResponse(BaseModel):
    message: str

class TempLoadResponse(BaseModel):
    real_pid: int
    code: str
    language: str
    updated_at: str
    hint_count: int