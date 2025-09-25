from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.model.models import ProblemSolution, User
from app.schemas.user import UserCreate, UserOut
from app.core.security import get_password_hash
from app.dependencies.auth import get_current_user
from dateutil.relativedelta import relativedelta

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.login_id == user.login_id).first():
        raise HTTPException(status_code=400, detail="Login ID already exists")
    
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_pw = get_password_hash(user.password)
    
    new_user = User(
        login_id=user.login_id,
        password_hash=hashed_pw,
        email=user.email
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.get("/mysubmissions")
def get_user_submissions(db: Session = Depends(get_db), user=Depends(get_current_user)):
    user_id = user.user_id

    submissions = (
        db.query(ProblemSolution)
        .filter(ProblemSolution.submit_user == user_id)
        .order_by(ProblemSolution.created_at.desc())
        .all()
    )

    result = []
    for s in submissions:
        result.append({
            "submission_id": s.solution_id,
            "real_pid": s.real_pid,
            "result": s.result,
            "memory_kb": s.memory_kb,
            "runtime_ms": s.runtime_ms,
            "language": s.language,
            "created_at": s.created_at.isoformat()
        })

    return result


@router.get("/new-mysubmit")
def get_user_submissions(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
    result_filter: Optional[str] = Query(None, description="PASS, FAIL, TLE, RTE, MLE, CE 중 하나 선택")
):
    user_id = user.user_id

    # 기본 쿼리
    query = db.query(ProblemSolution).filter(
        ProblemSolution.submit_user == user_id
    )

    # ✅ 필터링 로직
    if result_filter:
        if result_filter == "FAIL":
            # FAIL → 모든 실패 유형 포함
            fail_statuses = ["FAIL", "TLE", "RTE", "MLE", "CE"]
            query = query.filter(ProblemSolution.result.in_(fail_statuses))
        else:
            # 특정 값만 필터링
            query = query.filter(ProblemSolution.result == result_filter)

    submissions = query.order_by(ProblemSolution.created_at.desc()).all()

    result = []
    for s in submissions:
        result.append({
            "submission_id": s.solution_id,
            "real_pid": s.real_pid,
            "result": s.result,
            "memory_kb": s.memory_kb,
            "runtime_ms": s.runtime_ms,
            "language": s.language,
            "created_at": s.created_at.isoformat()
        })

    return result

@router.get("/solved-days")
def get_solved_days(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    로그인한 사용자가 'PASS'한 전체 날짜(YYYY-MM-DD) 리스트 반환
    """
    user_id = user.user_id
    # submit_user 컬럼이 문자열이면 str(user_id)로 맞추세요.
    user_key = user_id

    rows = (
        db.query(func.date(ProblemSolution.created_at))
        .filter(
            ProblemSolution.submit_user == user_key,
            ProblemSolution.result == "PASS",
        )
        .distinct()
        .order_by(func.date(ProblemSolution.created_at).asc())
        .all()
    )

    dates: List[str] = [r[0].isoformat() for r in rows]

    return {"dates": dates}