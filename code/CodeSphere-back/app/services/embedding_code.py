from sentence_transformers import SentenceTransformer
import psycopg2
from pgvector.psycopg2 import register_vector
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경변수에서 가져오기
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

# 모델 로딩
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# DB 연결
conn = psycopg2.connect(
    dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT
)
register_vector(conn)
cur = conn.cursor()

# 문제 불러오기
cur.execute("SELECT real_pid, title, body FROM problems")
problems = cur.fetchall()

for pid, title, body in problems:
    text = f"{title}\n{body}"
    embedding = model.encode(text).tolist()

    # upsert
    cur.execute("""
        INSERT INTO problem_embeddings (real_pid, embedding)
        VALUES (%s, %s)
        ON CONFLICT (real_pid) DO UPDATE SET embedding = EXCLUDED.embedding
    """, (pid, embedding))

conn.commit()
cur.close()
conn.close()