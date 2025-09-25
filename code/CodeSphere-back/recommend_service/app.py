import os
from datetime import datetime
from typing import List, Optional

from flask import Flask, request, jsonify
from sqlalchemy import create_engine, text, func
from sqlalchemy.orm import sessionmaker, scoped_session

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

# === 너의 프로젝트 모델 ===
from app.model.models import Problem, ProblemEmbedding, ProblemSolution, UserEmbedding

# -------------------------------------------------
# 환경/DB/모델 로드 (서버 시작 시 1회)
# -------------------------------------------------
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

# 모델 이름/차원 (문제/유저 임베딩이 동일 차원이 되도록 반드시 통일!)
EMB_MODEL_NAME = os.getenv("PROBLEM_EMB_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
EMB_DIM = int(os.getenv("EMB_DIM", "384"))

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = scoped_session(sessionmaker(bind=engine, autocommit=False, autoflush=False))

# SentenceTransformer 1회 로드
model = SentenceTransformer(EMB_MODEL_NAME)

app = Flask(__name__)

# -------------------------------------------------
# 유틸
# -------------------------------------------------
def _to_float_list(v) -> List[float]:
    try:
        return [float(x) for x in list(v)]
    except Exception:
        return []

def _avg_vector(vectors: List[List[float]]) -> List[float]:
    return [float(sum(col) / len(col)) for col in zip(*vectors)]

def _vec_literal(vec: List[float]) -> str:
    # pgvector literal e.g. "[0.1, 0.2, ...]"
    return f"[{', '.join(map(str, vec))}]"

def _embed_text(text: str) -> List[float]:
    # normalize=True → 코사인 유사도에 적합
    emb = model.encode(text, normalize_embeddings=True)
    return [float(x) for x in emb.tolist()]

# -------------------------------------------------
# 문제 임베딩 배치/단건
# -------------------------------------------------
def _upsert_problem_embedding(db, real_pid: int, vector: List[float]) -> None:
    # CAST(:emb AS vector) 로 안전 삽입 (드라이버 어댑터 불필요)
    db.execute(
        text("""
            INSERT INTO problem_embeddings (real_pid, embedding, updated_at)
            VALUES (:pid, CAST(:emb AS vector), NOW())
            ON CONFLICT (real_pid) DO UPDATE
            SET embedding = EXCLUDED.embedding, updated_at = EXCLUDED.updated_at
        """),
        {"pid": real_pid, "emb": _vec_literal(vector)}
    )



@app.post("/problems/reindex")
def problems_reindex_all():
    """
    모든 문제 임베딩 재계산
    body(optional): { "batch_size": 500 }
    """
    payload = request.get_json(silent=True) or {}
    batch_size = int(payload.get("batch_size", 500))

    db = SessionLocal()
    try:
        total = db.query(Problem).count()
        done = 0

        # 페이징 배치 처리
        offset = 0
        while True:
            rows = db.query(Problem).order_by(Problem.real_pid).offset(offset).limit(batch_size).all()
            if not rows:
                break
            for p in rows:
                text_input = f"{p.title}\n{p.body or ''}"
                vec = _embed_text(text_input)
                if len(vec) != EMB_DIM:
                    return jsonify({"ok": False, "error": f"dim mismatch: got {len(vec)} expected {EMB_DIM}"}), 500
                _upsert_problem_embedding(db, p.real_pid, vec)
                done += 1
            db.commit()
            offset += batch_size

        return jsonify({"ok": True, "total": total, "indexed": done})
    except Exception as e:
        db.rollback()
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        db.close()

@app.post("/problems/reindex_one")
def problems_reindex_one():
    """
    특정 문제만 재계산
    body: { "real_pid": 1003 }
    """
    payload = request.get_json(force=True, silent=True) or {}
    real_pid = payload.get("real_pid")
    if not isinstance(real_pid, int):
        return jsonify({"ok": False, "error": "real_pid(int) required"}), 400

    db = SessionLocal()
    try:
        p = db.query(Problem).filter(Problem.real_pid == real_pid).first()
        if not p:
            return jsonify({"ok": False, "error": "problem not found"}), 404

        text_input = f"{p.title}\n{p.body or ''}"
        vec = _embed_text(text_input)
        if len(vec) != EMB_DIM:
            return jsonify({"ok": False, "error": f"dim mismatch: got {len(vec)} expected {EMB_DIM}"}), 500

        _upsert_problem_embedding(db, p.real_pid, vec)
        db.commit()
        return jsonify({"ok": True, "real_pid": real_pid, "dim": len(vec)})
    except Exception as e:
        db.rollback()
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        db.close()

# -------------------------------------------------
# 유저 임베딩 업데이트 (평균)
# -------------------------------------------------
@app.post("/embedding/update")
def update_user_embedding_api():
    """
    body: { "user_id": 123 }
    """
    payload = request.get_json(force=True, silent=True) or {}
    user_id = payload.get("user_id")
    if not isinstance(user_id, int):
        return jsonify({"ok": False, "error": "user_id(int) required"}), 400

    db = SessionLocal()
    try:
        # PASS한 문제들
        solved = (
            db.query(Problem)
            .join(ProblemSolution, Problem.real_pid == ProblemSolution.real_pid)
            .filter(ProblemSolution.submit_user == user_id, ProblemSolution.result == "PASS")
            .all()
        )
        if not solved:
            return jsonify({"ok": True, "updated": False, "reason": "no_passed_problems"})

        vectors: List[List[float]] = []
        for pb in solved:
            pe = db.query(ProblemEmbedding).filter(ProblemEmbedding.real_pid == pb.real_pid).first()
            if pe:
                vec = _to_float_list(pe.embedding)
                if vec:
                    vectors.append(vec)

        # 벡터가 없으면 0벡터(정책 선택)
        if not vectors:
            avg_vec = [0.0] * EMB_DIM
        else:
            avg_vec = _avg_vector(vectors)

        now = datetime.utcnow()
        existing = db.query(UserEmbedding).filter(UserEmbedding.user_id == user_id).first()
        if existing:
            existing.embedding = avg_vec
            existing.updated_at = now
        else:
            db.add(UserEmbedding(user_id=user_id, embedding=avg_vec, updated_at=now))
        db.commit()

        return jsonify({"ok": True, "updated": True, "dim": len(avg_vec), "count_used": len(vectors)})
    except Exception as e:
        db.rollback()
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        db.close()

@app.get("/health")
def health():
    return jsonify({"ok": True, "model": EMB_MODEL_NAME, "dim": EMB_DIM})

if __name__ == "__main__":
    # 로컬호스트만 바인딩 (외부 접근 불가)
    app.run(host="127.0.0.1", port=7042)