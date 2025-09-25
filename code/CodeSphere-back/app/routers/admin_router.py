from fastapi import APIRouter
import requests

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/all")
def reindex_all_problems():
    r = requests.post("http://127.0.0.1:7042/problems/reindex", json={"batch_size": 500}, timeout=60)
    r.raise_for_status()
    return r.json()

@router.post("/one")
def reindex_one_problem(real_pid: int):
    r = requests.post("http://127.0.0.1:7042/problems/reindex_one", json={"real_pid": real_pid}, timeout=10)
    r.raise_for_status()
    return r.json()