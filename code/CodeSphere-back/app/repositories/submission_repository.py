from datetime import datetime
import requests
from sqlalchemy.orm import Session
from app.model.models import Problem, ProblemEmbedding, ProblemSolution, UserEmbedding
from pgvector.sqlalchemy import Vector
import numpy as np

EMBED_SVC = "http://127.0.0.1:7042/embedding/update"
EMB_DIM = 384  # 문제 임베딩과 동일 차원

def _to_float_list(v):
    try:
        return [float(x) for x in list(v)]
    except Exception:
        return []

def _avg_vector(vectors):
    return [float(sum(col) / len(col)) for col in zip(*vectors)]

def update_user_embedding_local(user_id: int, db: Session):
    passed = (
        db.query(Problem)
        .join(ProblemSolution, Problem.real_pid == ProblemSolution.real_pid)
        .filter(ProblemSolution.submit_user == user_id, ProblemSolution.result == "PASS")
        .all()
    )
    if not passed:
        return
    vectors = []
    for p in passed:
        pe = db.query(ProblemEmbedding).filter(ProblemEmbedding.real_pid == p.real_pid).first()
        if pe:
            vec = _to_float_list(pe.embedding)
            if vec:
                vectors.append(vec)
    avg_vec = [0.0] * EMB_DIM if not vectors else _avg_vector(vectors)

    now = datetime.utcnow()
    ex = db.query(UserEmbedding).filter(UserEmbedding.user_id == user_id).first()
    if ex:
        ex.embedding = avg_vec
        ex.updated_at = now
    else:
        db.add(UserEmbedding(user_id=user_id, embedding=avg_vec, updated_at=now))
    db.commit()

def update_user_embedding(user_id: int, db: Session):
    try:
        r = requests.post(EMBED_SVC, json={"user_id": user_id}, timeout=2.5)
        r.raise_for_status()
        if not r.json().get("ok", False):
            update_user_embedding_local(user_id, db)
    except Exception:
        update_user_embedding_local(user_id, db)

def score(level: int, hint_used: int) -> int:
    """제공된 로직에 따른 점수 계산 함수"""
    base = level * 40
    min_score = 20
    penalty_scale = max(1.0, (15 - level) / 2)
    hint_penalty = [0, int(10 * penalty_scale), int(20 * penalty_scale), int(30 * penalty_scale)]
    bonus = 10 if hint_used == 0 else 0
    raw_score = base - hint_penalty[hint_used] + bonus
    return round(max(raw_score, min_score) / 10)