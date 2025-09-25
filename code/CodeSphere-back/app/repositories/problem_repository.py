from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy import desc, func, text
from sqlalchemy.orm import Session
from app.model.models import Problem, ProblemEmbedding, ProblemSolution, UserEmbedding
from app.schemas.problem import ProblemListItem
from transformers import AutoTokenizer, AutoModel
import torch
from transformers import AutoTokenizer, AutoModel
import torch.nn.functional as F
from sqlalchemy import text
from psycopg2.extensions import adapt


# 모델 이름
model_name = "BAAI/bge-m3"

# 토크나이저 및 모델 로딩
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# 전체 문제 리스트
def get_problem_list(db: Session, limit: int = 10, page: int = 1, user_id: Optional[int] = None) -> List[ProblemListItem]:
    offset = (page - 1) * limit

    problems = (
        db.query(Problem)
        .order_by(Problem.real_pid)
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []

    for problem in problems:
        real_pid = problem.real_pid

        # 전체 제출 수
        submit_count = db.query(func.count()).select_from(ProblemSolution).filter(
            ProblemSolution.real_pid == real_pid
        ).scalar()

        # 정답 수
        correct_count = db.query(func.count()).select_from(ProblemSolution).filter(
            ProblemSolution.real_pid == real_pid,
            ProblemSolution.result == 'PASS'
        ).scalar()

        correct_rate = round(correct_count / submit_count, 4) if submit_count > 0 else 0.0

        # 로그인 유저일 경우 user_result 계산
        user_result = None
        if user_id:
            user_submits = db.query(ProblemSolution).filter(
                ProblemSolution.real_pid == real_pid,
                ProblemSolution.submit_user == user_id
            ).all()

            if not user_submits:
                user_result = "NONE"
            elif any(s.result == "PASS" for s in user_submits):
                user_result = "PASS"
            else:
                user_result = "FAIL"
        else:
            user_result = "NONE"  # 비로그인 사용자도 'NONE' 부여

        result.append(ProblemListItem(
            real_pid=real_pid,
            title=problem.title,
            level=problem.level,
            tag=problem.tag,
            submit_count=submit_count,
            correct_rate=correct_rate,
            user_result=user_result
        ))

    return result

def get_problem_by_real_pid(db: Session, real_pid: int):
    return db.query(Problem).filter(Problem.real_pid == real_pid).first()

# 비로그인 유저를 위한 문제 추천
def build_problem_list_items(db: Session, problems: List[Problem]) -> List[ProblemListItem]:
    result = []

    for problem in problems:
        real_pid = problem.real_pid

        submit_count = (
            db.query(func.count())
            .select_from(ProblemSolution)
            .filter(ProblemSolution.real_pid == real_pid)
            .scalar()
        )

        correct_count = (
            db.query(func.count())
            .select_from(ProblemSolution)
            .filter(
                ProblemSolution.real_pid == real_pid,
                ProblemSolution.result == 'PASS'
            )
            .scalar()
        )

        correct_rate = round(correct_count / submit_count, 4) if submit_count > 0 else 0.0

        result.append(ProblemListItem(
            real_pid=real_pid,
            title=problem.title,
            level=problem.level,
            tag=problem.tag,
            submit_count=submit_count,
            correct_rate=correct_rate,
            user_result="NONE"  # guest는 항상 NONE
        ))

    return result

def recommend_for_guest(db: Session, limit: int = 10) -> List[ProblemListItem]:
    result = []
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)

    # 1. 오늘 가장 많이 제출된 문제 Top 5
    top_today_pids = (
        db.query(ProblemSolution.real_pid)
        .filter(ProblemSolution.created_at >= today)
        .group_by(ProblemSolution.real_pid)
        .order_by(func.count().desc())
        .limit(5)
        .all()
    )
    top_today_pids = [pid[0] for pid in top_today_pids]

    top_today_problems = (
        db.query(Problem)
        .filter(Problem.real_pid.in_(top_today_pids))
        .all()
    )

    result.extend(build_problem_list_items(db, top_today_problems))

    # 2. 오늘 생성된 문제 Top 3
    recent_problems = (
        db.query(Problem)
        .filter(Problem.created_at >= yesterday)
        .order_by(desc(Problem.created_at))
        .limit(3)
        .all()
    )

    result.extend(build_problem_list_items(db, recent_problems))

    # 3. 랜덤 문제로 부족분 채우기
    if len(result) < limit:
        remaining = limit - len(result)
        existing_ids = {p.real_pid for p in result}

        random_problems = (
            db.query(Problem)
            .filter(~Problem.real_pid.in_(existing_ids))
            .order_by(func.random())
            .limit(remaining)
            .all()
        )

        result.extend(build_problem_list_items(db, random_problems))

    return result[:limit]

def build_problem_list_items_with_user(
    db: Session, problems: List[Problem], user_id: int
) -> List[ProblemListItem]:
    result = []

    for problem in problems:
        real_pid = problem.real_pid

        submit_count = db.query(func.count()).select_from(ProblemSolution).filter(
            ProblemSolution.real_pid == real_pid
        ).scalar()

        correct_count = db.query(func.count()).select_from(ProblemSolution).filter(
            ProblemSolution.real_pid == real_pid,
            ProblemSolution.result == "PASS"
        ).scalar()

        correct_rate = round(correct_count / submit_count, 4) if submit_count > 0 else 0.0

        # 유저 제출 결과
        user_solutions = db.query(ProblemSolution).filter(
            ProblemSolution.real_pid == real_pid,
            ProblemSolution.submit_user == user_id
        ).all()

        if not user_solutions:
            user_result = "NONE"
        elif any(s.result == "PASS" for s in user_solutions):
            user_result = "PASS"
        else:
            user_result = "FAIL"

        result.append(ProblemListItem(
            real_pid=real_pid,
            title=problem.title,
            level=problem.level,
            tag=problem.tag,
            submit_count=submit_count,
            correct_rate=correct_rate,
            user_result=user_result
        ))

    return result

def get_random_problems(db: Session, limit: int = 10) -> List[ProblemListItem]:
    problems = (
        db.query(Problem)
        .order_by(func.random())
        .limit(limit)
        .all()
    )

    result = []

    for problem in problems:
        real_pid = problem.real_pid

        submit_count = (
            db.query(func.count())
            .select_from(ProblemSolution)
            .filter(ProblemSolution.real_pid == real_pid)
            .scalar()
        )

        correct_count = (
            db.query(func.count())
            .select_from(ProblemSolution)
            .filter(
                ProblemSolution.real_pid == real_pid,
                ProblemSolution.result == 'PASS'
            )
            .scalar()
        )

        correct_rate = round(correct_count / submit_count, 4) if submit_count > 0 else 0.0

        result.append(ProblemListItem(
            real_pid=real_pid,
            title=problem.title,
            level=problem.level,
            tag=problem.tag,
            submit_count=submit_count,
            correct_rate=correct_rate,
        ))

    return result

def get_embedding(text: str) -> list[float]:
    input_text = "query: " + text
    inputs = tokenizer(input_text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        output = model(**inputs)
        embeddings = output.last_hidden_state[:, 0]  # CLS
        norm_embeddings = F.normalize(embeddings, p=2, dim=1)
    return norm_embeddings[0].tolist()

def format_pgvector(vector: list[float]) -> str:
    adapted = ','.join(str(adapt(float(x)).getquoted().decode()) for x in vector)
    return f"ARRAY[{adapted}]::vector"


def recommend_by_vector(user_id: int, db: Session, limit: int = 10) -> list[ProblemListItem]:
    user_embed_record = db.query(UserEmbedding).filter(UserEmbedding.user_id == user_id).first()

    if not user_embed_record:
        return []

    user_vector = [float(x) for x in user_embed_record.embedding]
    user_vector_str = f"[{', '.join(map(str, user_vector))}]"

    query = text("""
        SELECT p.real_pid,
               p.title,
               p.level,
               p.tag,
               cosine_distance(e.embedding, CAST(:user_vector AS vector)) AS similarity
        FROM problems p
        JOIN problem_embeddings e ON p.real_pid = e.real_pid
        ORDER BY similarity
        LIMIT :limit
    """)

    rows = db.execute(query, {
        "user_vector": user_vector_str,
        "limit": limit
    }).fetchall()

    # real_pid만 추출해서 실제 Problem 객체 불러오기
    real_pids = [row.real_pid for row in rows]
    problems = db.query(Problem).filter(Problem.real_pid.in_(real_pids)).all()

    return build_problem_list_items_with_user(db, problems, user_id)


def get_personalized_problems(user_id: int, db: Session, limit: int = 10):
    passed_count = db.query(ProblemSolution).filter(
        ProblemSolution.submit_user_id == user_id,  # submit_user → submit_user_id
        ProblemSolution.result == "PASS"
    ).count()

    if passed_count < 10:
        return get_random_problems(db, limit)

    # 정상이면 추천 실행
    vector_reco = recommend_by_vector(user_id, db, limit * 2)
    collab_reco = recommend_by_collaborative(user_id, db, limit * 2)
    return merge_recommendations(vector_reco, collab_reco, limit)

# def get_personalized_problems(user_id: int, db: Session, limit: int = 10):
#     # 사용자 임베딩 벡터가 있는지 확인
#     user_embed_record = db.query(UserEmbedding).filter(UserEmbedding.user_id == user_id).first()

#     if user_embed_record:
#         user_vector = [float(x) for x in user_embed_record.embedding]
#     else:
#         solved = (
#             db.query(Problem)
#             .join(ProblemSolution, Problem.real_pid == ProblemSolution.real_pid)
#             .filter(ProblemSolution.submit_user == user_id, ProblemSolution.result == "PASS")
#             .all()
#         )
#         if not solved:
#             return get_random_problems(db)

#         vectors = []
#         for problem in solved:
#             embedding_record = db.query(ProblemEmbedding).filter(
#                 ProblemEmbedding.real_pid == problem.real_pid
#             ).first()
#             if embedding_record:
#                 vectors.append(embedding_record.embedding)

#         if not vectors:
#             return get_random_problems(db)

#         avg_vector = [float(sum(col) / len(col)) for col in zip(*vectors)]
#         user_vector = avg_vector

#         new_embed = UserEmbedding(user_id=user_id, embedding=avg_vector, updated_at=datetime.now())
#         db.merge(new_embed)
#         db.commit()

#     # ⭐ 핵심 수정: 문자열로 벡터 변환
#     user_vector_str = f"[{', '.join(map(str, user_vector))}]"

#     query = text("""
#         SELECT p.real_pid,
#                p.title,
#                p.level,
#                p.tag,
#                cosine_distance(e.embedding, CAST(:user_vector AS vector)) AS similarity
#         FROM problems p
#         JOIN problem_embeddings e ON p.real_pid = e.real_pid
#         ORDER BY similarity
#         LIMIT :limit
#     """)

#     rows = db.execute(query, {
#         "user_vector": user_vector_str,
#         "limit": limit
#     }).fetchall()

#     result = []
#     for row in rows:
#         real_pid = row.real_pid
#         submit_count = db.query(func.count()).select_from(ProblemSolution).filter(
#             ProblemSolution.real_pid == real_pid
#         ).scalar()

#         correct_count = db.query(func.count()).select_from(ProblemSolution).filter(
#             ProblemSolution.real_pid == real_pid,
#             ProblemSolution.result == "PASS"
#         ).scalar()

#         user_solutions = db.query(ProblemSolution).filter(
#             ProblemSolution.real_pid == real_pid,
#             ProblemSolution.submit_user == user_id
#         ).all()

#         if not user_solutions:
#             user_result = "NONE"
#         elif any(s.result == "PASS" for s in user_solutions):
#             user_result = "PASS"
#         else:
#             user_result = "FAIL"

#         result.append(ProblemListItem(
#             real_pid=real_pid,
#             title=row.title,
#             level=row.level,
#             tag=row.tag,
#             submit_count=submit_count,
#             correct_rate=round(correct_count / submit_count, 4) if submit_count else 0.0,
#             user_result=user_result
#         ))

#     return result

def recommend_by_collaborative(user_id: int, db: Session, limit: int = 10) -> list[ProblemListItem]:
    solved_real_pids = db.query(ProblemSolution.real_pid).filter(
        ProblemSolution.submit_user == user_id,
        ProblemSolution.result == "PASS"
    ).distinct().all()

    solved_real_pids = [pid for (pid,) in solved_real_pids]

    if not solved_real_pids:
        return []

    similar_users = db.query(ProblemSolution.submit_user).filter(
        ProblemSolution.real_pid.in_(solved_real_pids),
        ProblemSolution.submit_user != user_id,
        ProblemSolution.result == "PASS"
    ).distinct().limit(30).all()
    similar_user_ids = [uid for (uid,) in similar_users]

    if not similar_user_ids:
        return []

    recommended_real_pids = db.query(ProblemSolution.real_pid).filter(
        ProblemSolution.submit_user.in_(similar_user_ids),
        ProblemSolution.result == "PASS",
        ~ProblemSolution.real_pid.in_(solved_real_pids)
    ).group_by(ProblemSolution.real_pid).order_by(func.count().desc()).limit(limit).all()

    recommended_real_pids = [pid for (pid,) in recommended_real_pids]

    problems = db.query(Problem).filter(Problem.real_pid.in_(recommended_real_pids)).all()

    return build_problem_list_items_with_user(db, problems, user_id)


def merge_recommendations(a: list[ProblemListItem], b: list[ProblemListItem], limit: int = 10) -> list[ProblemListItem]:
    """
    두 추천 결과 리스트를 가중치 없이 단순 병합 (중복 제거)
    """
    seen = set()
    merged = []

    for item in a + b:
        if item.real_pid not in seen:
            merged.append(item)
            seen.add(item.real_pid)
        if len(merged) >= limit:
            break

    return merged

def get_adaptive_recommendations(user_id: Optional[int], db: Session, limit: int = 10) -> list[ProblemListItem]:
    """
    사용자 로그인 상태, 풀이 이력에 따라 추천 전략을 분기하는 메인 함수
    """
    if user_id is None:
        # 👤 비로그인 유저
        return recommend_for_guest(db, limit)

    # 로그인 유저의 문제 풀이 수 체크
    solved_count = db.query(ProblemSolution).filter(
        ProblemSolution.submit_user == user_id,
        ProblemSolution.result == "PASS"
    ).count()

    if solved_count < 10:
        # 👤 Cold Start 상태 → 게스트와 동일하게 추천
        return recommend_for_guest(db, limit)

    # 👤 성숙 사용자: 벡터 기반 + 협업 필터링 기반 추천 결합
    vec_based = recommend_by_vector(user_id, db, limit)
    collab_based = recommend_by_collaborative(user_id, db, limit)

    # 하이브리드 방식 (50:50 가중치 예시)
    return merge_recommendations(vec_based, collab_based, limit)