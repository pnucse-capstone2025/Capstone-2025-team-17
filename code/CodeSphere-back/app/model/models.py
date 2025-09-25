from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Integer, Sequence, String, Text, JSON, TIMESTAMP, ForeignKey, Boolean, BigInteger
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime, timedelta, timezone


KST = timezone(timedelta(hours=9))

class Hint(Base):
    __tablename__ = "hints"

    hint_id = Column(Integer, primary_key=True, index=True)
    real_pid = Column(Integer, ForeignKey("problems.real_pid", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    content = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, default=lambda: datetime.now(KST))

    problem = relationship("Problem", back_populates="hint", foreign_keys=[real_pid])
    user = relationship("User", back_populates="hint", foreign_keys=[user_id])


class TemporarySolution(Base):
    __tablename__ = "temporary_solutions"

    temp_id = Column(Integer, primary_key=True, index=True)
    real_pid = Column(Integer, ForeignKey("problems.real_pid"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    code = Column(Text, nullable=False)
    language = Column(Text, nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, default=lambda: datetime.now(KST))


class Problem(Base):
    __tablename__ = "problems"
    real_pid = Column(
        Integer,
        Sequence('real_pid_seq'),  # DB에 만든 시퀀스와 연결
        primary_key=True,
        autoincrement=True
    )
    title = Column(Text, nullable=False)
    body = Column(Text, nullable=False)

    example_io = Column(JSON)  # 예제 입출력: [{"input": "...", "output": "..."}]
    test_io = Column(JSON)  # 테스트 입출력: [{"input": "...", "output": "..."}]

    level = Column(Integer)
    tag = Column(JSON)  # 예: ["dfs", "graph"]
    made = Column(Boolean, default=False)

    input = Column(Text)
    output = Column(Text)
    problem_constraint = Column(Text)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, default=lambda: datetime.now(KST))

    # 관계 설정
    solutions = relationship("ProblemSolution", back_populates="problem", cascade="all, delete-orphan")
    hint = relationship("Hint", back_populates="problem")

    embedding_problem_vector = relationship("ProblemEmbedding", back_populates="problemE")
    user_problem_scoreP = relationship("UserProblemScore", back_populates="problemS")
    creator = relationship("User", back_populates="created_problems")


class ProblemSolution(Base):
    __tablename__ = "problem_solutions"

    solution_id = Column(BigInteger, primary_key=True, index=True)
    real_pid = Column(Integer, ForeignKey("problems.real_pid", ondelete="CASCADE"))
    submit_user = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    
    language = Column(String)  # 예: "Python", "C++"
    code = Column(Text)

    legacy = Column(Boolean, default=False)
    result = Column(String)
    runtime_ms = Column(Integer)
    memory_kb = Column(Integer)

    created_at = Column(TIMESTAMP(timezone=True), nullable=False, default=lambda: datetime.now(KST))

    problem = relationship("Problem", back_populates="solutions", foreign_keys=[real_pid])
    user = relationship("User", back_populates="submissions")


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    login_id = Column(String(50), nullable=False, unique=True)
    password_hash = Column(Text, nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, default=lambda: datetime.now(KST))
    score = Column(Integer, nullable=False, server_default='0')

    submissions = relationship("ProblemSolution", back_populates="user", cascade="all, delete")
    hint = relationship("Hint", back_populates="user", cascade="all, delete")

    embedding_user_vector = relationship("UserEmbedding", back_populates="userE")
    user_problem_scoreU = relationship("UserProblemScore", back_populates="userS")
    created_problems = relationship("Problem", back_populates="creator")


class ProblemEmbedding(Base):
    __tablename__ = "problem_embeddings"

    real_pid = Column(Integer, ForeignKey("problems.real_pid", ondelete="CASCADE"), primary_key=True)
    embedding = Column(Vector(), nullable=False)
    updated_at = Column(TIMESTAMP, nullable=False)

    problemE = relationship("Problem", back_populates="embedding_problem_vector")


class UserEmbedding(Base):
    __tablename__ = "user_embeddings"

    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    embedding = Column(Vector(), nullable=False)
    updated_at = Column(TIMESTAMP, nullable=False)

    userE = relationship("User", back_populates="embedding_user_vector")


class UserProblemScore(Base):
    __tablename__ = "user_problem_scores"

    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    real_pid = Column(Integer, ForeignKey("problems.real_pid", ondelete="CASCADE"), primary_key=True)
    score = Column(Integer, nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, default=lambda: datetime.now(KST))

    problemS = relationship("Problem", back_populates="user_problem_scoreP")
    userS = relationship("User", back_populates="user_problem_scoreU")