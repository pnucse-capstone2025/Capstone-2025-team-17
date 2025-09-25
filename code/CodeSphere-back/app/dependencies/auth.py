from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.model.models import User
from app.database import get_db
from sqlalchemy.orm import Session
from app.core.security import ACCESS_SECRET_KEY, ALGORITHM

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token decode failed")
    
def get_optional_user(credentials) -> Optional[User]:
    if not credentials:
        return None

    try:
        payload = jwt.decode(credentials.credentials, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("user_id")
    except JWTError:
        return None
    
# ✅ 반환 타입 주석도 int로 맞추기
def get_optional_user_new(credentials) -> Optional[int]:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("user_id")  # int 또는 None
    except JWTError:
        return None

# def get_optional_current_user(
#     token: Optional[str] = Depends(oauth2_scheme_optional),
#     db: Session = Depends(get_db)
# ) -> Optional[User]:
#     """
#     사용자가 로그인 상태(유효한 토큰 소유)이면 user 객체를 반환하고,
#     로그인하지 않았거나 토큰이 없으면 에러 대신 None을 반환합니다.
#     """
#     # 1. 토큰이 아예 없는 경우 (비로그인 사용자)
#     if token is None:
#         return None

#     try:
#         # 2. 토큰을 디코딩하여 payload를 얻습니다.
#         payload = jwt.decode(token, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
#         # JWT 표준인 'sub' 클레임에 user_id가 저장되어 있다고 가정합니다.
#         user_id: str = payload.get("sub") 
#         if user_id is None:
#             return None
#     except JWTError:
#         # 3. 토큰이 유효하지 않은 경우 (변조되었거나 만료된 토큰)
#         return None

#     # 4. payload에서 얻은 user_id로 DB에서 실제 사용자 정보를 조회합니다.
#     user = db.query(User).filter(User.user_id == int(user_id)).first()
    
#     # 5. DB에 해당 사용자가 없는 경우
#     if user is None:
#         return None

#     return user