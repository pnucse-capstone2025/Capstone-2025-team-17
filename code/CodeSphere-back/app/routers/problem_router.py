from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import JSON, Float, String, case, cast, func, or_
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Session
from app.database import get_db
from app.model.models import Problem, ProblemSolution, User
from app.schemas.problem import ProblemListResponse, ProblemOut, ProblemListItem
from app.repositories.problem_repository import get_adaptive_recommendations, get_personalized_problems, get_problem_by_real_pid, get_problem_list, recommend_for_guest
import json
from app.dependencies.auth import get_optional_user, get_optional_user_new

router = APIRouter(prefix="/problems", tags=["problems"])
security = HTTPBearer(auto_error=False) 

# 전체 문제 탭에서 모든 문제 제공하기
@router.get("/list", response_model=ProblemListResponse)
def get_problem_list_api(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=100),
    page: int = Query(1, ge=1),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    user_id = None
    try:
        user = get_optional_user(credentials)
        user_id = user if isinstance(user, int) else None
    except:
        pass

    total_count = db.query(Problem).count()
    problems = get_problem_list(db=db, limit=limit, page=page, user_id=user_id)

    return {
        "total": total_count,
        "data": problems
    }

@router.get("/new-list", response_model=ProblemListResponse)
def get_problem_list_new(
    search: Optional[str] = None,
    difficulty: Optional[str] = None,
    tags: Optional[str] = None,
    solved_status: Optional[str] = None,
    sort_by: Optional[str] = 'real_pid_asc',
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    모든 알고리즘 문제 목록을 다양한 조건으로 필터링하고 정렬하여 조회합니다.
    - 로그인하지 않은 사용자도 조회가 가능합니다.
    - 로그인 시에만 `solved_status` 필터와 `user_result` 응답이 활성화됩니다.
    """

    # 집계 정의
    total_submissions = func.count(ProblemSolution.solution_id)
    pass_submissions = func.sum(case((ProblemSolution.result == 'PASS', 1), else_=0))
    submitters_expr = func.count(func.distinct(ProblemSolution.submit_user))

    # ✅ 정답률/제출자수 "표현식"을 만들어 두고 label 부여
    acceptance_rate_expr = (pass_submissions.cast(Float) / func.nullif(total_submissions.cast(Float), 0)).label('acceptance_rate')
    submit_count_expr = submitters_expr.label('submit_count')

    # 1) 기본 쿼리 (JOIN + GROUP BY)
    query = (
        db.query(
            Problem,
            acceptance_rate_expr,
            submit_count_expr
        )
        .outerjoin(ProblemSolution, Problem.real_pid == ProblemSolution.real_pid)
        .group_by(Problem.real_pid)
    )

    # 2) 필터링
    if search:
        search_term = f"%{search}%"
        query = query.filter(or_(Problem.title.like(search_term), cast(Problem.tag, String).like(search_term)))

    difficulty_map = {"쉬움": (1, 5), "보통": (6, 10), "어려움": (11, 15)}
    if difficulty and difficulty in difficulty_map:
        min_level, max_level = difficulty_map[difficulty]
        query = query.filter(Problem.level.between(min_level, max_level))


    if tags:
        tags_list = [t.strip() for t in tags.split(',') if t.strip()]
        if tags_list:
            any_clauses = [cast(Problem.tag, JSONB).contains([t]) for t in tags_list]
            query = query.filter(or_(*any_clauses))

    # ✅ 항상 int 또는 None을 반환/보관
    user_id = get_optional_user_new(credentials)  # int | None

    # 로그인 사용자만 해결 여부 필터 적용
    if user_id is not None and solved_status in ["solved", "unsolved"]:
        solved_pids_subquery = (
            db.query(ProblemSolution.real_pid)
            .filter(
                ProblemSolution.submit_user == str(user_id),
                ProblemSolution.result == 'PASS'
            )
            .distinct()
        )
        if solved_status == "solved":
            query = query.filter(Problem.real_pid.in_(solved_pids_subquery))
        else:  # "unsolved"
            query = query.filter(Problem.real_pid.notin_(solved_pids_subquery))

    # [추가] 전체 개수
    total_count = query.count()

    # 3) 정렬
    sort_criteria = {
        'real_pid': Problem.real_pid,
        'title': Problem.title,
        'level': Problem.level,
        # ✅ 문자열 키 대신 실제 컬럼/표현식 사용
        'acceptance_rate': acceptance_rate_expr,
        'submitters': submit_count_expr,
        'submit_count': submit_count_expr,
    }

    sort_key, _, sort_dir = sort_by.rpartition('_') if '_' in sort_by else (sort_by, None, 'asc')
    if sort_key in sort_criteria:
        column = sort_criteria[sort_key]
        query = query.order_by(column.desc() if sort_dir == 'desc' else column.asc())

    # 4) 페이징 조회
    results = query.offset(skip).limit(limit).all()

    # 사용자별 상태 매핑
    user_status_map = {}
    if user_id is not None and results:
        problem_ids = [res.Problem.real_pid for res in results]
        user_submissions = (
            db.query(ProblemSolution.real_pid, ProblemSolution.result)
            .filter(
                ProblemSolution.submit_user == str(user_id),
                ProblemSolution.real_pid.in_(problem_ids)
            )
            .all()
        )
        pass_pids = {s.real_pid for s in user_submissions if s.result == 'PASS'}
        fail_pids = {s.real_pid for s in user_submissions if s.result != 'PASS'}

        for pid in problem_ids:
            if pid in pass_pids:
                user_status_map[pid] = "PASS"
            elif pid in fail_pids:
                user_status_map[pid] = "FAIL"
            else:
                user_status_map[pid] = "NONE"

    data_items = [
        ProblemListItem(
            real_pid=res.Problem.real_pid,
            title=res.Problem.title,
            level=res.Problem.level,
            tag=res.Problem.tag,
            submit_count=res.submit_count,
            correct_rate=res.acceptance_rate or 0.0,
            user_result=user_status_map.get(res.Problem.real_pid, "NONE")
        )
        for res in results
    ]

    return ProblemListResponse(total=total_count, data=data_items)


@router.get("/recommend_problems")
def recommend_problems(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # 사용자 확인 (없으면 None 반환)
    user_id = get_optional_user(credentials)

    # 통합 추천 엔진 호출
    problems = get_adaptive_recommendations(user_id, db)

    return problems

# problem 라우터 뒤에 숫자를 검색하려 하기때문에 맨 마지막에 둬야함.
@router.get("/{real_pid}", response_model=ProblemOut)
def get_problem(real_pid: int, db: Session = Depends(get_db)):

    problem = get_problem_by_real_pid(db, real_pid)
    
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    return problem