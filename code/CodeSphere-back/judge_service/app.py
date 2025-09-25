import ast
from flask import Flask, request, jsonify
import tempfile
import subprocess
import os
import time
import shutil
import resource

app = Flask(__name__)

BANNED_NODES = {
    #ast.Import: "import",
    #ast.ImportFrom: "from ... import",
    #ast.Call: "function call"
}

BANNED_KEYWORDS = ['eval', 'exec', 'os.', 'subprocess', 'open(', 'compile', 'globals', 'locals', 'sys.exit']

try:
    import psutil
except ImportError:
    psutil = None

MEMORY_LIMIT_MB = 128  # 제한할 메모리 (MB)

def is_malicious(code: str) -> str:
    for keyword in BANNED_KEYWORDS:
        if keyword in code:
            return keyword
    return None

def check_ast_for_banned_usage(code: str):
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return f"SyntaxError: {e}"

    for node in ast.walk(tree):
        if isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
            for alias in node.names:
                if alias.name.split(".")[0] in BANNED_KEYWORDS:
                    return f"금지된 모듈 import 사용: {alias.name}"
        elif isinstance(node, ast.Call):
            func = node.func
            if isinstance(func, ast.Name) and func.id in BANNED_KEYWORDS:
                return f"금지된 함수 사용: {func.id}()"
            elif isinstance(func, ast.Attribute) and func.attr in BANNED_KEYWORDS:
                return f"금지된 함수/속성 사용: {func.attr}"
    return None  # 안전함

def _has_gnu_time():
    # GNU time은 /usr/bin/time (쉘 빌틴 time 말고 외부 바이너리)
    return os.path.exists("/usr/bin/time")

def run_single_test(code: str, input_data: str, expected_output: str):
    temp_dir = tempfile.mkdtemp()
    code_path = os.path.join(temp_dir, "main.py")
    memfile = os.path.join(temp_dir, "mem.txt")

    with open(code_path, "w", encoding="utf-8") as f:
        f.write(code)

    base_cmd = [
        "prlimit",
        f"--as={MEMORY_LIMIT_MB * 1024 * 1024}",  # byte 단위
        "--",
        "python3",
        code_path,
    ]

    if _has_gnu_time():
        cmd = ["/usr/bin/time", "-f", "%M", "-o", memfile] + base_cmd
        use_psutil_fallback = False
    else:
        cmd = base_cmd
        use_psutil_fallback = True

    try:
        start = time.time()
        peak_rss_kb = 0

        proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # psutil 기반 메모리 추적
        p = None
        if use_psutil_fallback and psutil is not None:
            try:
                p = psutil.Process(proc.pid)
            except Exception:
                p = None

        try:
            while True:
                try:
                    stdout, stderr = proc.communicate(
                        input=input_data.encode(),
                        timeout=0.03
                    )
                    break
                except subprocess.TimeoutExpired:
                    if p is not None:
                        try:
                            rss = p.memory_info().rss // 1024
                            if rss > peak_rss_kb:
                                peak_rss_kb = rss
                        except psutil.NoSuchProcess:
                            pass
                    continue
        except subprocess.TimeoutExpired:
            proc.kill()
            return {
                "input": input_data,
                "expected": expected_output,
                "user_output": "Timeout",
                "result": "TLE",
                "runtime_ms": 3000,
                "memory_kb": 0
            }

        elapsed_ms = int((time.time() - start) * 1000)

        # 메모리 사용량 계산
        memory_kb = 0
        if _has_gnu_time():
            try:
                with open(memfile, "r") as mf:
                    content = mf.read().strip()
                    if content:
                        memory_kb = int(content)
            except Exception:
                memory_kb = 0
        elif psutil is not None:
            memory_kb = int(peak_rss_kb)
        else:
            try:
                usage_before = resource.getrusage(resource.RUSAGE_CHILDREN)
                usage_after = resource.getrusage(resource.RUSAGE_CHILDREN)
                memory_kb = max(0, usage_after.ru_maxrss - usage_before.ru_maxrss)
            except Exception:
                memory_kb = 0

        user_output = stdout.decode().strip()
        stderr_output = stderr.decode().strip()

        # 판정
        if "SyntaxError" in stderr_output:
            result = "CE"
        elif ("MemoryError" in stderr_output) or ("killed" in stderr_output.lower()) or (proc.returncode == -9):
            result = "MLE"
        elif proc.returncode != 0 and memory_kb >= int(MEMORY_LIMIT_MB * 1024 * 0.9):
            result = "MLE"
        elif proc.returncode != 0:
            result = "RTE"
        elif user_output == expected_output.strip():
            result = "PASS"
        else:
            result = "FAIL"

        return {
            "input": input_data,
            "expected": expected_output,
            "user_output": user_output if user_output else stderr_output,
            "result": result,
            "runtime_ms": elapsed_ms,
            "memory_kb": memory_kb
        }

    except Exception as e:
        return {
            "input": input_data,
            "expected": expected_output,
            "user_output": f"Error: {e}",
            "result": "RTE",
            "runtime_ms": 0,
            "memory_kb": 0
        }

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


@app.route("/judge", methods=["POST"])
def judge_code():
    data = request.json
    code = data.get("code")
    testcases = data.get("testcases")

    # 금지어 검사
    keyword = is_malicious(code)
    if keyword:
        return jsonify({
            "result": "FAIL",
            "results": [{
                "input": "",
                "expected": "",
                "user_output": "denied keyword used",
                "result": "FAIL",
                "runtime_ms": 0,
                "memory_kb": 0
            }],
            "runtime_ms": 0,
            "memory_kb": 0
        })

    # AST 검사
    ast_check = check_ast_for_banned_usage(code)
    if ast_check:
        return jsonify({
            "result": "FAIL",
            "results": [{
                "input": "",
                "expected": "",
                "user_output": ast_check,
                "result": "FAIL",
                "runtime_ms": 0,
                "memory_kb": 0
            }],
            "runtime_ms": 0,
            "memory_kb": 0
        })

    results = []
    total_runtime_ms = 0
    max_memory_kb = 0
    overall_result = "PASS"

    for case in testcases:
        r = run_single_test(code, case["input"], case["output"])
        results.append(r)

        total_runtime_ms += r["runtime_ms"]
        max_memory_kb = max(max_memory_kb, r["memory_kb"])

        if r["result"] == "RTE":
            overall_result = "FAIL"
            break
        if r["result"] != "PASS":
            overall_result = "FAIL"

    return jsonify({
        "result": overall_result,
        "results": results,
        "runtime_ms": total_runtime_ms,
        "memory_kb": max_memory_kb
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=7040)