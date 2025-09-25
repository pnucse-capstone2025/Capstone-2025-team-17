import os
import re
import json
import psycopg2
import requests
import sys
from dotenv import load_dotenv
from flask import Flask, request, jsonify

# --- 1. Flask 앱 및 환경변수 설정 ---
app = Flask(__name__)

# .env 파일 경로를 정확하게 지정해주세요.
load_dotenv("/home/graduate/CodeSphere-ai/hint/.env")

# 필수 환경변수 목록
required_env_vars = [
    "DB_USER", "DB_HOST", "DB_PORT", "DB_NAME", "DB_PASSWORD",
    "DIFY_API_KEY", "DIFY_BASE_URL"
]
env_vars = {var: os.getenv(var) for var in required_env_vars}
if any(value is None for value in env_vars.values()):
    missing = [var for var, value in env_vars.items() if value is None]
    print(f"❌ 오류: 필수 환경변수가 .env 파일에 없습니다: {', '.join(missing)}")
    sys.exit(1)

# --- 2. 데이터베이스 연동 함수 ---
def get_problem_info(real_pid):
    """DB에서 문제의 전체 정보를 가져옵니다."""
    connection = None
    try:
        connection = psycopg2.connect(
            user=env_vars["DB_USER"], password=env_vars["DB_PASSWORD"],
            host=env_vars["DB_HOST"], port=int(env_vars["DB_PORT"]),
            database=env_vars["DB_NAME"]
        )
        with connection.cursor() as cur:
            # Dify 프롬프트에 필요한 모든 정보를 조회합니다.
            cur.execute("""
                SELECT title, body, tag, example_io, input, output, problem_constraint, level 
                FROM problems 
                WHERE real_pid = %s
            """, (real_pid,))
            problem_row = cur.fetchone()
            return problem_row
    except Exception as e:
        print(f"❌ DB 오류: {e}")
        return None
    finally:
        if connection:
            connection.close()

# --- 3. Dify 연동 함수 (스트리밍 모드로 수정) ---
def request_hint_from_dify(problem_info_tuple, user_code, used_hints):
    """Dify 에이전트에 스트리밍 모드로 힌트를 요청하고, 응답을 취합하여 반환합니다."""
    url = f"{env_vars['DIFY_BASE_URL']}" # Dify 앱의 chat-messages 엔드포인트
    headers = {
        "Authorization": f"Bearer {env_vars['DIFY_API_KEY']}",
        "Content-Type": "application/json"
    }

    # DB에서 조회한 튜플을 변수에 할당
    title, body, tag, example_io, input_desc, output_desc, constraints, level = problem_info_tuple
    
    # Dify 변수 타입(string)에 맞게 객체를 JSON 문자열로 변환
    tag_str = json.dumps(tag, ensure_ascii=False) if tag else "[]"
    example_str = json.dumps(example_io, ensure_ascii=False) if example_io else "[]"

    payload = {
        "inputs": {
            "problem_title": title,
            "problem_body": body,
            "problem_tags": tag_str,
            "problem_examples": example_str,
            "code": user_code,
            "hint_level": str(used_hints + 1) # FastAPI로부터 받은 힌트 횟수
        },
        "query": "Provide a hint based on the variables.",
        "response_mode": "streaming", # [수정] 스트리밍 모드로 요청
        "user": "codesphere-user" # 사용자 식별자
    }

    try:
        # [수정] stream=True로 스트리밍 응답을 받습니다.
        with requests.post(url, headers=headers, json=payload, stream=True, timeout=60) as res:
            res.raise_for_status()
            
            full_hint_text = ""
            # 스트리밍 데이터를 한 줄씩 읽어옵니다.
            for line in res.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    if decoded_line.startswith('data:'):
                        try:
                            data = json.loads(decoded_line[5:])
                            # agent_message 또는 message 이벤트에서 answer 조각을 추출하여 합칩니다.
                            if data.get('event') in ['agent_message', 'message']:
                                full_hint_text += data.get('answer', '')
                        except json.JSONDecodeError:
                            continue
            
            if not full_hint_text:
                 return None, "Dify 스트리밍 응답에서 유효한 힌트를 찾을 수 없습니다."

            return full_hint_text, None # 성공 시 (최종 힌트, None) 반환
        
    except requests.exceptions.RequestException as e:
        error_message = f"Dify API 요청 실패: {e}"
        if e.response is not None:
            error_message += f" - 응답: {e.response.text}"
        return None, error_message # 실패 시 (None, 에러 메시지) 반환

# --- 4. Flask API 엔드포인트 ---
@app.route("/generate_hint", methods=["POST"])
def generate_hint_api():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    real_pid = data.get("real_pid")
    user_id = data.get("user_id")
    user_code = data.get("user_code", "")
    used_hints = data.get("used_hints", 0) # FastAPI가 계산한 힌트 횟수

    if not real_pid or not user_id:
        return jsonify({"error": "real_pid and user_id are required"}), 400

    # 1. DB에서 문제 정보 조회
    problem_info = get_problem_info(real_pid)
    if not problem_info:
        return jsonify({"error": f"Problem with real_pid={real_pid} not found."}), 404

    # 2. Dify에 힌트 요청
    hint, error = request_hint_from_dify(problem_info, user_code, used_hints)
    
    if error:
        return jsonify({"error": error}), 502 # 502 Bad Gateway

    return jsonify({"hint": hint})

# --- 5. 서버 실행 ---
if __name__ == "__main__":
    # Gunicorn으로 실행할 때는 이 부분이 직접 실행되지 않습니다.
    # 로컬 테스트용으로만 사용됩니다.
    app.run(host="127.0.0.1", port=7041)