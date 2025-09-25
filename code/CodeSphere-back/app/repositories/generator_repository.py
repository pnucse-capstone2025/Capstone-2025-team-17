import math
import re
from typing import List, Optional

from requests import Session
from sqlalchemy import text

def _extract_section(text: str, title: str) -> Optional[str]:
    m = re.search(rf"{re.escape(title)}\s*(.*?)\s*(?=##|\Z)", text, re.DOTALL)
    return m.group(1).strip() if m else None

def _map_tag(algorithm_type: str) -> List[str]:
    t = algorithm_type.strip().lower()
    mapping = {
        "dfs": ["graph", "dfs"],
        "bfs": ["graph", "bfs"],
        "dijkstra": ["graph", "shortest-path", "dijkstra"],
        "dp": ["dp"],
        "dynamic programming": ["dp"],
        "two pointers": ["two-pointers"],
        "greedy": ["greedy"],
        "binary search": ["binary-search"],
        "union find": ["disjoint-set", "union-find"],
        "topological sort": ["graph", "topological-sort"],
        "tree": ["tree"],
        "segment tree": ["segment-tree", "range-query"],
        "prefix sum": ["prefix-sum"],
        "math": ["math"],

        # 신규 추가 유형
        "heap": ["heap", "priority-queue"],
        "hash table": ["hash-table", "hash-map"],
        "trie": ["trie", "prefix-tree"],
        "stack / queue": ["stack", "queue"],
        "minimum spanning tree": ["graph", "mst"],
        "floyd-warshall": ["graph", "shortest-path", "floyd-warshall"],
        "backtracking": ["backtracking"],
        "divide and conquer": ["divide-and-conquer"],
        "string": ["string", "string-manipulation"],
        "bitmask": ["bitmask", "bit-manipulation"],
        "implementation": ["implementation", "simulation"],
        "combinatorics": ["math", "combinatorics"],
    }
    for k, v in mapping.items():
        if k in t:
            return v
    return [algorithm_type]

def _map_level(difficulty: str) -> int:
    d = difficulty.strip().lower()
    table = {
        "쉬움": 5, "easy": 5,
        "중간": 10, "medium": 10,
        "어려움": 15, "hard": 15,
    }
    return table.get(d, 10)

def _vec_literal(vec: List[float]) -> str:
    return f"[{', '.join(map(str, vec))}]"

def _cosine_similarity_db(db: Session, real_pid: int, user_vec: List[float]) -> Optional[float]:
    if not user_vec:
        return None
    row = db.execute(
        text("""
            SELECT 1 - cosine_distance(e.embedding, CAST(:v AS vector)) AS sim
            FROM problem_embeddings e
            WHERE e.real_pid = :pid
            LIMIT 1
        """),
        {"v": _vec_literal(user_vec), "pid": real_pid}
    ).fetchone()
    if not row or row.sim is None:
        return None
    try:
        return float(row.sim)
    except Exception:
        return None

def _personalized_level(base_level: int, sim: Optional[float]) -> Optional[int]:
    if sim is None:
        return None
    if sim >= 0.90: delta = -3
    elif sim >= 0.80: delta = -2
    elif sim >= 0.70: delta = -1
    elif sim >= 0.60: delta = 0
    elif sim >= 0.50: delta = +1
    else: delta = +2
    return max(1, min(15, base_level + delta))

def _to_finite_float(x, default=None):
    if x is None:
        return default
    try:
        f = float(x)
        return f if math.isfinite(f) else default
    except Exception:
        return default

def _sanitize_vec(vec):
    """임베딩 벡터 내 NaN/Inf를 0.0으로 교체"""
    if vec is None:
        return None
    out = []
    for x in list(vec):
        try:
            f = float(x)
            out.append(f if math.isfinite(f) else 0.0)
        except Exception:
            out.append(0.0)
    return out

def _strip_outer_markdown_fence(text: str) -> str:
    m = re.match(r"^```(?:markdown)?\s*\n(.*)\n```$", text.strip(), re.DOTALL)
    return m.group(1) if m else text

def _extract_constraints(md: str):
    """
    반환: (raw_text, items)
      - raw_text: 섹션 원문(코드펜스 제거/트리밍)
      - items: 불릿 목록 리스트 (없으면 빈 리스트)
    """
    md = _strip_outer_markdown_fence(md)

    # 섹션 제목 후보들(공백/표기 변형 포함)
    titles = [
        "## 제한 사항", "## 제한사항",
        "## 제약 사항", "## 제약조건",
        "## Constraints", "## Constraint"
    ]

    section = None
    for title in titles:
        m = re.search(rf"{re.escape(title)}\s*(.*?)\s*(?=\n##|\Z)", md, re.DOTALL)
        if m:
            section = m.group(1)
            break
    if not section:
        return "", []

    # 코드펜스로 한 번 더 싸여온 경우 제거
    fence = re.match(r"^```(?:\w+)?\s*\n(.*)\n```$", section.strip(), re.DOTALL)
    raw = fence.group(1).strip() if fence else section.strip()

    # 불릿/번호 목록 추출 (-, *, 숫자.)
    lines = [ln.strip() for ln in raw.splitlines() if ln.strip()]
    items = []
    for ln in lines:
        # '- xxx' / '* xxx' / '1. xxx' / '1) xxx' 허용
        m = re.match(r"^(?:[-*]\s+|\d+[.)]\s+)(.+)$", ln)
        items.append(m.group(1).strip()) if m else items.append(ln)

    return raw, items