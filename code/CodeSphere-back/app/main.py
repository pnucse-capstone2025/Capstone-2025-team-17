from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import problem_router, hint_router, auth_router, user_router, submission_router, admin_router, generator_router, ranking_router
from app.utils.scheduler import start_scheduler
import os

# ROOT_PATH = os.getenv("ROOT_PATH", "")

app = FastAPI(
    # docs_url="/docs",
    # openapi_url="/openapi.json",
    # root_path=ROOT_PATH
)

@app.on_event("startup")
def startup_event():
    start_scheduler()

origins = [
    "http://localhost:5173",
    "https://codesphere.kro.kr",
    "https://www.codesphere.kro.kr"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # 모든 도메인 허용
    allow_credentials=True,
    allow_methods=["*"],            # GET, POST, PUT 등 모든 메서드 허용
    allow_headers=["*"],            # 모든 헤더 허용
)

app.include_router(problem_router.router)
app.include_router(hint_router.router)
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(ranking_router.router)
app.include_router(submission_router.router)
app.include_router(generator_router.router)
app.include_router(admin_router.router)