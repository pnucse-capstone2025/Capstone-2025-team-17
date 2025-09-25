from typing import List, Literal, Optional
from pydantic import BaseModel
import pydantic

class SubmitRequest(BaseModel):
    real_pid: int
    language: str
    code: str

# 기존 제출 응답 (summary 전용)
class SubmitResponse(BaseModel):
    result: Literal["PASS", "FAIL", "TLE", "RTE", "MLE", "CE"]
    passed: int
    total: int
    runtime_ms: Optional[int]
    memory_kb: Optional[int]

# 개별 테스트케이스 결과
class TestCaseResult(BaseModel):
    input: str
    expectedOutput: str
    actualOutput: str
    passed: bool
    runtime_ms: Optional[int]
    memory_kb: Optional[int]

# 테스트 실행 전체 응답
class TestSubmitResponse(SubmitResponse):
    testCases: List[TestCaseResult]