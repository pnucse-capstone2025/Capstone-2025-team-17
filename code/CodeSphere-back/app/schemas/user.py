from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    login_id: str
    password: str
    email: EmailStr

class UserOut(BaseModel):
    user_id: int
    login_id: str
    email: str

    class Config:
       from_attributes = True