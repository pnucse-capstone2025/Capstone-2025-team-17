from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict

class ExampleIO(BaseModel):
    input: str
    output: str

class ProblemOut(BaseModel):
    real_pid: int
    title: str
    body: str
    example_io: list[ExampleIO]
    level: int
    tag: list[str]
    input: Optional[str] = None
    output: Optional[str] = None
    problem_constraint: Optional[str] = None

    class Config:
        from_attributes = True

class ProblemListItem(BaseModel):
    real_pid: int
    title: str
    level: int
    tag: list[str]
    submit_count: int
    correct_rate: float  # 0.0 ~ 1.0
    user_result: Literal["PASS", "FAIL", "NONE"] = "NONE"

    model_config = ConfigDict(from_attributes=True)

class ProblemListResponse(BaseModel):
    total: int
    data: List[ProblemListItem]