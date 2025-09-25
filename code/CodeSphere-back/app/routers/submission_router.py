from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
import requests
from sqlalchemy.orm import Session
from app.model.models import Hint, Problem, ProblemSolution, TemporarySolution, UserProblemScore
from app.schemas.submit import SubmitRequest, SubmitResponse, TestCaseResult, TestSubmitResponse
from app.dependencies.auth import get_current_user
from app.database import get_db
from app.services.judge_client import request_judge_server
from app.schemas.temp_solution import TempLoadResponse, TempSaveResponse, TempSaveRequest
from app.repositories.submission_repository import score, update_user_embedding

router = APIRouter(prefix="/submissions", tags=["submissions"])

def determine_final_result(results: list) -> str:
    # 우선순위 높은 순서로 검사
    priority = ["CE", "RTE", "TLE", "MLE", "FAIL", "PASS"]
    for p in priority:
        if any(r["result"] == p for r in results):
            return p
    return "FAIL"

@router.post("/save", response_model=TempSaveResponse)
def save_temp_solution(
    request: TempSaveRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    existing = db.query(TemporarySolution).filter_by(
        real_pid=request.real_pid,
        user_id=user.user_id
    ).first()

    if existing:
        existing.code = request.code
        existing.language = request.language
        existing.updated_at = datetime.utcnow()
    else:
        new_temp = TemporarySolution(
            real_pid=request.real_pid,
            user_id=user.user_id,
            code=request.code,
            language=request.language
        )
        db.add(new_temp)

    db.commit()
    return {"message": "임시 저장 완료"}

@router.get("/load/{real_pid}", response_model=TempLoadResponse)
def load_temp_solution(
    real_pid: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    temp = db.query(TemporarySolution).filter_by(
        real_pid=real_pid,
        user_id=user.user_id
    ).first()

    if not temp:
        raise HTTPException(status_code=404, detail="임시 저장된 풀이가 없습니다.")
    
    hint_count = db.query(Hint).filter(
        Hint.real_pid == real_pid,
        Hint.user_id == user.user_id
    ).count()

    return {
        "real_pid": temp.real_pid,
        "code": temp.code,
        "language": temp.language,
        "updated_at": temp.updated_at.isoformat(),
        "hint_count": hint_count
    }

@router.post("/submit", response_model=SubmitResponse)
def submit_code(
    request: SubmitRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    problem = db.query(Problem).filter(Problem.real_pid == request.real_pid).first()
    if not problem or not problem.test_io:
        raise HTTPException(status_code=404, detail="문제가 존재하지 않거나 테스트케이스가 없습니다.")

    judge_result = request_judge_server(request.code, problem.test_io)
    final_result = determine_final_result(judge_result["results"])

    # DB 저장 (아직 커밋하지 않음)
    new_solution = ProblemSolution(
        real_pid=request.real_pid,
        language=request.language,
        code=request.code,
        result=final_result,
        submit_user=user.user_id,
        runtime_ms=judge_result.get("runtime_ms"),
        memory_kb=judge_result.get("memory_kb")
    )
    db.add(new_solution)

    if final_result == "PASS":
        # 임시 풀이 삭제
        db.query(TemporarySolution).filter_by(
            real_pid=request.real_pid,
            user_id=user.user_id
        ).delete(synchronize_session=False)

        # 유저 임베딩 갱신
        update_user_embedding(user.user_id, db)

        # 1. 이미 해결한 문제인지 확인
        existing_score = db.query(UserProblemScore).filter(
            UserProblemScore.user_id == user.user_id,
            UserProblemScore.real_pid == request.real_pid
        ).first()

        # 2. 처음 해결한 문제일 경우에만 점수 부여
        if not existing_score:
            # 2-1. [변경] DB에서 사용한 힌트 개수 조회
            hint_count = db.query(Hint).filter(
                Hint.user_id == user.user_id,
                Hint.real_pid == request.real_pid
            ).count()

            # 2-2. [변경] 조회된 힌트 개수로 점수 계산
            calculated_score = score(problem.level, hint_count)

            # 2-3. user_problem_scores 테이블에 기록
            new_score_record = UserProblemScore(
                user_id=user.user_id,
                real_pid=request.real_pid,
                score=calculated_score
            )
            db.add(new_score_record)

            # 2-4. users 테이블의 총점 업데이트
            user.score = (user.score or 0) + calculated_score

    db.commit()

    return SubmitResponse(
        result=final_result,
        passed=judge_result.get("passed", sum(r["result"] == "PASS" for r in judge_result["results"])),
        total=len(problem.test_io),
        runtime_ms=judge_result.get("runtime_ms"),
        memory_kb=judge_result.get("memory_kb")
    )


@router.post("/test", response_model=TestSubmitResponse)
def test_submission_with_example_io(
    request: SubmitRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # 문제 조회
    problem = db.query(Problem).filter(Problem.real_pid == request.real_pid).first()
    if not problem or not problem.example_io:
        raise HTTPException(status_code=404, detail="문제가 존재하지 않거나 예제 테스트케이스가 없습니다.")

    # 채점 서버 요청
    payload = {
        "code": request.code,
        "testcases": problem.example_io
    }
    response = requests.post("http://localhost:7040/judge", json=payload)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="채점 서버 오류")

    judge_result = response.json()

    # 개별 테스트케이스 변환
    test_case_results = []
    for r in judge_result["results"]:
        test_case_results.append(TestCaseResult(
            input=r["input"],
            expectedOutput=r["expected"],
            actualOutput=r["user_output"],
            passed=(r["result"] == "PASS"),
            runtime_ms=r.get("runtime_ms"),
            memory_kb=r.get("memory_kb")
        ))

    # 최종 결과 계산
    final_result = determine_final_result(judge_result["results"])
    total_runtime = judge_result.get("runtime_ms")
    max_memory = judge_result.get("memory_kb")

    return TestSubmitResponse(
        result=final_result,
        passed=sum(tc.passed for tc in test_case_results),
        total=len(test_case_results),
        runtime_ms=total_runtime,
        memory_kb=max_memory,
        testCases=test_case_results
    )