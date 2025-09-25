from pydantic import BaseModel

class LoginRequest(BaseModel):
    login_id: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_id: int
    login_id: str
    email: str

class RefreshRequest(BaseModel):
    refresh_token: str