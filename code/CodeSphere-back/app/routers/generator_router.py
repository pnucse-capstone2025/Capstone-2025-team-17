from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import requests
from sqlalchemy import cast, func
from sqlalchemy.dialects.postgresql import JSONB, array

from app.database import get_db
from app.model.models import Problem, ProblemSolution, UserEmbedding
from app.schemas.generator import GenerateProblemRequest, GenerateProblemResponse, GenerateProblemResponseNew, CreatedProblemInfo
from app.dependencies.auth import get_current_user
from app.repositories.generator_repository import (
    _cosine_similarity_db,
    _map_level,
    _map_tag,
    _personalized_level,
    _sanitize_vec,
    _to_finite_float,
)

GEN_SVC_URL = "http://127.0.0.1:7043/generate_problem"

router = APIRouter(prefix="/generator", tags=["generator"])

@router.get("/my-problems", response_model=List[CreatedProblemInfo])
def get_my_created_problems(db: Session = Depends(get_db), user = Depends(get_current_user)):
    """
    현재 로그인된 사용자가 생성한 모든 문제의 목록을 조회합니다.
    """
    created_problems = db.query(Problem).filter(Problem.user_id == user.user_id).order_by(Problem.real_pid.desc()).all()
    return created_problems


@router.post("/generate", response_model=GenerateProblemResponse)
def generate_problem(req: GenerateProblemRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    # 1) Flask 생성기 호출
    try:
        r = requests.post(GEN_SVC_URL, json=req.dict(), timeout=120)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"generator service error: {e}")

    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="generator service bad status")
    data = r.json()
    if not data.get("ok"):
        raise HTTPException(status_code=502, detail="generator service returned not ok")

    # 2) 실패면 저장 없이 리턴
    if not data.get("success"):
        return GenerateProblemResponse(
            success=False
        )

    # 3) 성공 필드 정리
    title = data.get("problem_title")
    description = data.get("problem_description")
    problem_constraints = data.get("problem_constraints")
    problem_input_desc = data.get("problem_input_desc")
    problem_output_desc = data.get("problem_output_desc")

    example_io = data.get("example_io") or []
    test_io    = data.get("test_io") or []
    solution_code = data.get("solution_code")
    

    # 4) tag/level 생성
    tag = _map_tag(req.algorithm_type)
    level = _map_level(req.difficulty)

    # 5) DB 저장
    problem = Problem(
        title=title,
        body=description,
        input=problem_input_desc,
        output=problem_output_desc,
        problem_constraint=problem_constraints,
        example_io=example_io,
        test_io=test_io,
        tag=tag,
        level=level,
        made=True,
    )

    db.add(problem)
    db.commit()
    db.refresh(problem)

    # 6) (선택) 생성 문제 임베딩 계산 트리거
    try:
        requests.post(
            "http://127.0.0.1:7042/problems/reindex_one",
            json={"real_pid": problem.real_pid},
            timeout=5,
        )
    except Exception:
        pass

    # 7) 유저 임베딩 기반 개인화 레벨
    personalized_level = None
    similarity = None
    if user.user_id:
        ue = db.query(UserEmbedding).filter(UserEmbedding.user_id == user.user_id).first()
        if ue is not None and ue.embedding is not None:
            user_vec = _sanitize_vec(ue.embedding)  # ⬅️ NaN/Inf 제거
            if user_vec:
                sim = _cosine_similarity_db(db, problem.real_pid, user_vec)  # 0..1 or None
                similarity = _to_finite_float(sim, default=None)             # ⬅️ finite 보정
                if similarity is not None:
                    personalized_level = _personalized_level(level, similarity)

    # 8) 응답 (직렬화 안전 보정)
    return GenerateProblemResponse(
        success=True,
        real_pid=problem.real_pid,
        title=title,
        body=description,
        problem_constraint=problem_constraints,
        input=problem_input_desc,
        output=problem_output_desc,
        example_io=example_io,
        solve_code=solution_code,
        tag=tag,
        level=int(level)
    )

@router.post("/generate/new", response_model=GenerateProblemResponseNew)
def generate_problem(req: GenerateProblemRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    
    # 1. 사용자가 요청한 유형의 문제를 몇 개 풀었는지 확인합니다.
    target_tags = _map_tag(req.algorithm_type)

    # 사용자가 'PASS'한 문제들의 ID를 problem_solutions 테이블에서 먼저 조회합니다.
    solved_problem_ids = db.query(ProblemSolution.real_pid).filter(
        ProblemSolution.submit_user == user.user_id,
        ProblemSolution.result == 'PASS'
    ).distinct()

    # 조회된 문제 ID 목록 중에서, 요청된 알고리즘 태그를 가진 문제의 개수를 셉니다.
    solved_count = db.query(Problem).filter(
        Problem.real_pid.in_(solved_problem_ids),
        # [수정] target_tags를 PostgreSQL의 text[] 배열로 명시적으로 변환합니다.
        func.jsonb_exists_any(cast(Problem.tag, JSONB), array(target_tags))
    ).count()

    # 2. 3문제 미만으로 풀었을 경우, 생성 없이 바로 반환합니다.
    if solved_count < 3:
        return GenerateProblemResponseNew(
            success=False,
            solved_count=solved_count
        )

    # 3) Flask 생성기 호출
    try:
        r = requests.post(GEN_SVC_URL, json=req.dict(), timeout=120)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"generator service error: {e}")

    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="generator service bad status")
    data = r.json()
    if not data.get("ok"):
        raise HTTPException(status_code=502, detail="generator service returned not ok")

    # 4) Flask 서버에서 생성 실패 시, 맞춘 문제 개수와 함께 실패 응답 반환
    if not data.get("success"):
        return GenerateProblemResponseNew(
            success=False,
            solved_count=solved_count
        )

    # 5) 성공 필드 정리
    title = data.get("problem_title")
    description = data.get("problem_description")
    problem_constraints = data.get("problem_constraints")
    problem_input_desc = data.get("problem_input_desc")
    problem_output_desc = data.get("problem_output_desc")

    example_io = data.get("example_io") or []
    test_io    = data.get("test_io") or []
    solution_code = data.get("solution_code")
    
    # 6) tag/level 생성
    tag = _map_tag(req.algorithm_type)
    level = _map_level(req.difficulty)

    # 7) DB 저장 시 user_id를 함께 저장합니다.
    problem = Problem(
        title=title,
        body=description,
        input=problem_input_desc,
        output=problem_output_desc,
        problem_constraint=problem_constraints,
        example_io=example_io,
        test_io=test_io,
        tag=tag,
        level=level,
        made=True,
        user_id=user.user_id # 문제 생성자 ID 기록
    )
    db.add(problem)
    db.commit()
    db.refresh(problem)

    # 8) (선택) 생성 문제 임베딩 계산 트리거
    try:
        requests.post(
            "http://127.0.0.1:7042/problems/reindex_one",
            json={"real_pid": problem.real_pid},
            timeout=5,
        )
    except Exception:
        pass


    # --- [추가] 생성된 문제의 정답 코드를 예시 풀이로 저장 ---
    if solution_code:
        example_solution = ProblemSolution(
            real_pid=problem.real_pid,
            language="python",
            code=solution_code,
            result="PASS"
        )
        db.add(example_solution)
        db.commit()
    # ----------------------------------------------------


    # 10) 최종 응답 반환
    return GenerateProblemResponseNew(
        success=True,
        solved_count=solved_count,
        real_pid=problem.real_pid,
        title=title,
        body=description,
        problem_constraint=problem_constraints,
        input=problem_input_desc,
        output=problem_output_desc,
        example_io=example_io,
        tag=tag,
        level=int(level)
    )