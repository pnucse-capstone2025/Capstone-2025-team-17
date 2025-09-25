from fastapi import APIRouter, Depends
from requests import Session
from sqlalchemy import func, select
from app.schemas.ranking import MyRankResponse, RankingResponse, UserRankInfo
from app.database import get_db
from app.model.models import User, UserProblemScore
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/ranking", tags=["ranking"])

@router.get("", response_model=RankingResponse, summary="사용자 랭킹 조회")
def get_user_ranking(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    사용자들의 점수 순위를 조회합니다.
    - **맞춘 문제 수**가 응답에 포함됩니다.
    - skip, limit을 사용하여 페이지네이션을 구현할 수 있습니다.
    """
    ranked_users_query = db.query(
        User,
        func.count(UserProblemScore.real_pid).label("solved_count")
    ).outerjoin(
        UserProblemScore, User.user_id == UserProblemScore.user_id
    ).group_by(
        User.user_id
    ).order_by(
        User.score.desc()
    ).offset(skip).limit(limit).all()

    # 응답 데이터 형식에 맞게 가공
    user_ranks = [
        UserRankInfo(
            rank=skip + i + 1,
            login_id=user.login_id,
            total_score=user.score or 0,
            solved_count=count or 0
        )
        for i, (user, count) in enumerate(ranked_users_query)
    ]

    return RankingResponse(ranks=user_ranks)

@router.get("/my-rank", response_model=MyRankResponse, summary="나의 랭킹 정보 조회")
def get_my_rank(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    현재 로그인된 사용자의 순위, 점수, 맞춘 문제 수를 조회합니다. (인증 필요)
    """
    # 1. 모든 유저의 점수 기준 순위를 계산하는 서브쿼리를 생성합니다.
    rank_subquery = select(
        User.user_id,
        func.rank().over(order_by=User.score.desc()).label('rank')
    ).alias('user_ranks')

    # 2. 메인 쿼리에서 현재 유저의 정보와 순위, 그리고 맞춘 문제 수를 함께 조회합니다.
    my_rank_info = db.query(
        User,
        rank_subquery.c.rank,
        func.count(UserProblemScore.real_pid).label("solved_count")
    ).outerjoin(
        UserProblemScore, User.user_id == UserProblemScore.user_id
    ).join(
        rank_subquery, User.user_id == rank_subquery.c.user_id
    ).filter(
        User.user_id == user.user_id
    ).group_by(
        User.user_id, rank_subquery.c.rank
    ).first()

    if not my_rank_info:
        # 사용자가 랭킹에 없는 경우 (예: 점수가 없는 신규 유저)
        # 이 경우, 맞춘 문제 수만 따로 조회합니다.
        solved_count = db.query(UserProblemScore).filter(UserProblemScore.user_id == user.user_id).count()
        return MyRankResponse(
            rank=None,
            login_id=user.login_id,
            total_score=user.score or 0,
            solved_count=solved_count
        )

    db_user, rank, solved_count = my_rank_info
    
    return MyRankResponse(
        rank=rank,
        login_id=db_user.login_id,
        total_score=db_user.score or 0,
        solved_count=solved_count or 0
    )