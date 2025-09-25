from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.auth import get_current_user
from app.database import get_db
from app.model.models import Hint, TemporarySolution
import requests
from datetime import datetime
from app.schemas.hint import AllHintsResponse, HintRequest, HintResponse

router = APIRouter(prefix="/hints", tags=["hints"])

def save_temporary_solution(db: Session, user_id: int, real_pid: int, user_code: str, language: str):
    """
    사용자의 코드를 임시저장 테이블에 저장하거나 업데이트합니다 (Upsert).
    /submission/save 엔드포인트와 동일한 로직을 수행합니다.
    """
    # 기존에 저장된 임시 코드가 있는지 확인
    temp_solution = db.query(TemporarySolution).filter(
        TemporarySolution.user_id == user_id,
        TemporarySolution.real_pid == real_pid
    ).first()

    if temp_solution:
        # 있다면 코드와 언어, 시간만 업데이트
        temp_solution.code = user_code
        temp_solution.language = language
        # [수정] /submission/save 와 동일하게 utcnow() 사용
        temp_solution.updated_at = datetime.utcnow()
        print(f"임시 코드 업데이트: user_id={user_id}, real_pid={real_pid}")
    else:
        # 없다면 새로 생성
        new_temp_solution = TemporarySolution(
            user_id=user_id,
            real_pid=real_pid,
            code=user_code,
            language=language
            # created_at, updated_at은 DB에서 자동으로 설정됩니다.
        )
        db.add(new_temp_solution)
        print(f"새로운 임시 코드 저장: user_id={user_id}, real_pid={real_pid}")

@router.get("/myhint/{real_pid}", response_model=List[HintResponse])
def get_my_hints_for_problem(
    real_pid: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    특정 문제에 대해 현재 로그인된 사용자가 받은 모든 힌트를 시간순으로 조회합니다.
    """
    hints = db.query(Hint).filter(
        Hint.user_id == user.user_id,
        Hint.real_pid == real_pid
    ).order_by(Hint.created_at.asc()).all()
    return hints


@router.post("/request", response_model=AllHintsResponse)
def request_and_get_all_hints(
    request_data: HintRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    힌트 요청 및 임시저장, 그리고 모든 힌트 조회

    - **힌트 생성**: 문제당 최대 3회까지 AI 서버에 새 힌트를 요청합니다.
    - **코드 임시저장**: 힌트를 요청하는 시점의 코드를 임시저장합니다.
    - **힌트 조회**: 요청 후, 해당 문제에 대한 모든 힌트를 반환합니다.
    - [수정] 생성된 힌트 내용 앞에는 몇 번째 요청인지 나타내는 번호가 추가됩니다.
    """
    user_id = user.user_id
    real_pid = request_data.real_pid
    user_code = request_data.user_code
    language = request_data.language

    existing_hints = db.query(Hint).filter(
        Hint.real_pid == real_pid,
        Hint.user_id == user_id
    ).all()

    if len(existing_hints) < 3:
        hint_number = len(existing_hints) + 1
        save_temporary_solution(db, user_id, real_pid, user_code, language)

        try:
            response = requests.post(
                "http://127.0.0.1:7041/generate_hint",
                json={"real_pid": real_pid, "user_id": user_id, "user_code": user_code},
                timeout=30
            )
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            error_detail = f"AI 서버 요청 실패: {str(e)}"
            try:
                if e.response:
                    error_detail += f" - {e.response.json().get('error')}"
            except: pass
            raise HTTPException(status_code=500, detail=error_detail)

        hint_text = response.json().get("hint")
        if not hint_text:
            raise HTTPException(status_code=500, detail="힌트 생성 실패 (빈 응답)")

        formatted_hint_text = f"### {hint_number}번째 힌트\n\n{hint_text}"

        new_hint = Hint(
            user_id=user_id,
            real_pid=real_pid,
            content=formatted_hint_text,
            created_at=datetime.now()
        )
        db.add(new_hint)
        db.commit()


    all_hints = db.query(Hint).filter(
        Hint.real_pid == real_pid,
        Hint.user_id == user_id
    ).order_by(Hint.created_at.asc()).all()

    if len(existing_hints) == 3:
        return {
            "total_hints": 4,
            "hints": all_hints
        }

    # [수정] 최종 반환 형식을 새로운 모델에 맞게 변경합니다.
    return {
        "total_hints": len(all_hints),
        "hints": all_hints
    }
