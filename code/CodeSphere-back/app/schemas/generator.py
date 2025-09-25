from typing import List, Optional
from pydantic import BaseModel, Field

class GenerateProblemRequest(BaseModel):
    algorithm_type: str = Field("DFS", description="문제 알고리즘 유형")
    difficulty: str = Field("중간", description="난이도: 쉬움/중간/어려움(또는 easy/medium/hard)")

class IOItem(BaseModel):
    input: str
    output: str

class GenerateProblemResponse(BaseModel):
    success: bool
    real_pid: Optional[int] = None
    title: Optional[str] = None
    body: Optional[str] = None
    input: Optional[str] = None
    output: Optional[str] = None
    problem_constraint: Optional[str] = None
    example_io: Optional[List[IOItem]] = None
    tag: Optional[List[str]] = None
    level: Optional[int] = None

# --- 250904 새로 추가한 모델. 추후 수정 ---

class CreatedProblemInfo(BaseModel):
    real_pid: Optional[int] = None
    title: Optional[str] = None
    tag: Optional[List[str]] = None
    level: Optional[int] = None

class GenerateProblemResponseNew(BaseModel):
    success: bool
    solved_count: int  # 사용자가 해당 유형의 문제를 맞춘 개수

    # 아래는 성공적으로 생성되었을 때만 채워지는 필드입니다.
    real_pid: Optional[int] = None
    title: Optional[str] = None
    body: Optional[str] = None
    input: Optional[str] = None
    output: Optional[str] = None
    problem_constraint: Optional[str] = None
    example_io: Optional[List[IOItem]] = None
    tag: Optional[List[str]] = None
    level: Optional[int] = None