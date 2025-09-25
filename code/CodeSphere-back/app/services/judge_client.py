import requests

def request_judge_server(code: str, testcases: list):
    JUDGE_SERVER_URL = "http://localhost:7040/judge"
    payload = {
        "code": code,
        "testcases": testcases
    }

    try:
        response = requests.post(JUDGE_SERVER_URL, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise RuntimeError(f"Judge server error: {e}")