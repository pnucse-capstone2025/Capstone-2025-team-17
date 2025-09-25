import os
import re
import tempfile
import subprocess
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence

# --- 환경 변수 및 LLM 설정 ---
# .env 파일이 있다면 해당 경로를 지정해주세요.
# load_dotenv("/home/graduate/CodeSphere-ai/hint/.env")

# 사용자의 편의를 위해 API 키를 직접 입력받도록 수정
if "OPENAI_API_KEY" not in os.environ:
    try:
        load_dotenv() 
        OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        if not OPENAI_API_KEY:
            raise ValueError
    except (FileNotFoundError, ValueError):
        OPENAI_API_KEY = input("OpenAI API 키를 입력해주세요: ")
else:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(
    model="gpt-4o",
    api_key=OPENAI_API_KEY,
    temperature=0.7,
)

# --- 프롬프트 정의 ---

# 1. 문제 아이디어 생성
prompt_step1_idea = PromptTemplate.from_template("""
당신은 최고의 알고리즘 문제 출제자입니다.
아래 조건에 맞춰 창의적인 알고리즘 문제의 아이디어와 기본 구조를 생성해주세요.

- **문제 유형**: {algorithm_type}
- **난이도**: {difficulty}

**출력 형식 (반드시 ## 헤더를 사용하여 각 섹션을 구분해주세요):**
## 문제 제목
(문제의 핵심을 요약하는 한 줄 제목)

## 문제 설명
(사용자가 {algorithm_type}을 떠올릴 수 있도록 흥미로운 배경 스토리와 함께 문제 상황을 자세히 설명해주세요. 단, 알고리즘 이름은 절대 언급하지 마세요.)

## 제한 사항
(입력값의 범위, 시간 제한 등 제약 조건을 명시해주세요.)
""")

# 2. 공개 예시 생성
prompt_step2_examples = PromptTemplate.from_template("""
당신은 알고리즘 문제의 테스트케이스를 만드는 전문가입니다.
아래 문제 설명을 보고, 문제의 핵심을 잘 보여주는 간단하고 명확한 **공개용 입출력 예시 2쌍**을 만들어주세요.

**문제 설명:**
{problem_description}

**제한 사항:**
{constraints}

**출력 형식 (반드시 ## 헤더를 사용하고 아래 형식을 정확히 지켜주세요):**
## 예시 입출력
입력 1:
```
(입력 내용)
```
출력 1:
```
(출력 내용)
```
입력 2:
```
(입력 내용)
```
출력 2:
```
(출력 내용)
```
""")

# 3. 정답 코드 생성
prompt_step3_code = PromptTemplate.from_template("""
당신은 뛰어난 알고리즘 해결사입니다.
아래 문제 설명과 입출력 예시를 완벽하게 만족하는 Python `solve()` 함수를 작성해주세요.

**문제 설명:**
{problem_description}

**입출력 예시:**
{public_examples_text}

**출력 형식 (반드시 ## 헤더를 사용해주세요):**
## 정답 코드
```python
def solve():
    # 여기에 Python 정답 코드를 작성
```
""")

# 4. 채점용 '입력' 생성 (프롬프트 수정)
prompt_step4_grading_inputs = PromptTemplate.from_template("""
당신은 QA 전문가입니다.
아래 문제 설명과 제약 조건을 보고, 코드의 안정성을 검증할 수 있는 **경계값(boundary values)과 예외 상황을 포함한 채점용 '입력값' 10개**를 만들어주세요. 출력값은 만들 필요 없습니다.
(예: N이 최소/최대일 경우, 간선이 하나도 없는 경우, 모든 노드가 연결된 경우 등)

**문제 설명:**
{problem_description}

**제한 사항:**
{constraints}

**출력 형식 (반드시 ## 헤더를 사용하고 아래 형식을 정확히 지켜주세요):**
## 채점용 테스트케이스 입력
입력 1:
```
(입력 내용)
```
입력 2:
```
(입력 내용)
```
(이어서 10번까지 동일한 형식으로 생성)
""")

# 5. 코드 수정 (공개 예시 실패 시)
prompt_fix_code = PromptTemplate.from_template("""
당신은 최고의 알고리즘 디버거입니다.
당신이 작성한 정답 코드가, 참고했던 '공개 예시'조차 통과하지 못하는 심각한 논리적 오류를 포함하고 있습니다.

**당신의 임무:**
아래 문제 설명, 실패 보고서, 그리고 기존 코드를 분석하여 **정답 코드(`solve` 함수)를 완벽하게 수정**하는 것입니다.

### 문제 설명
{problem_description}

### 검증 실패 보고서 (공개 예시 실패)
```text
{error_report}
```

### 오류가 있는 기존 정답 코드
```python
{solution_code}
```

**출력 형식 (수정된 코드만):**
## 정답 코드
```python
def solve():
    # 수정된 Python 코드
```
""")

# --- 실행 체인 정의 ---
chain_step1 = prompt_step1_idea | llm
chain_step2 = prompt_step2_examples | llm
chain_step3 = prompt_step3_code | llm
chain_step4_inputs = prompt_step4_grading_inputs | llm
chain_fix_code = prompt_fix_code | llm

# --- 파싱 및 실행 헬퍼 함수 ---

def parse_from_section(text, section_title_base):
    pattern = re.compile(
        r"^[#]+\s*" + re.escape(section_title_base) + r"[^\n]*\n(.*?)(?=\n^[#]+\s|\Z)",
        re.DOTALL | re.MULTILINE
    )
    match = pattern.search(text)
    return match.group(1).strip() if match else ""

def extract_test_cases(text_block):
    inputs = re.findall(r"입력 \d+:\s*```(?:\w*\n)?(.*?)```", text_block, re.DOTALL)
    outputs = re.findall(r"출력 \d+:\s*```(?:\w*\n)?(.*?)```", text_block, re.DOTALL)
    return list(zip([i.strip() for i in inputs], [o.strip() for o in outputs]))

def extract_inputs_only(text_block):
    return [match.strip() for match in re.findall(r"입력 \d+:\s*```(?:\w*\n)?(.*?)```", text_block, re.DOTALL)]

def extract_solve_code(text_block):
    match = re.search(r"```python\s*(def solve\(\):.*?)```", text_block, re.DOTALL)
    return match.group(1).strip() if match else ""

def run_solve_code_on_input(code, test_input):
    full_code = code + "\n\nif __name__ == '__main__':\n    solve()\n"
    tmp_filename = ""
    try:
        with tempfile.NamedTemporaryFile(mode="w+", suffix=".py", delete=False, encoding='utf-8') as tmp:
            tmp_filename = tmp.name
            tmp.write(full_code)
        
        result = subprocess.run(
            ["python3", tmp_filename],
            input=test_input.encode('utf-8'),
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10
        )
        if result.returncode != 0:
            return f"[Runtime Error]\n{result.stderr.decode('utf-8', 'ignore').strip()}"
        return result.stdout.decode('utf-8', 'ignore').strip()
    except subprocess.TimeoutExpired: return "[Timeout]"
    except Exception as e: return f"[Execution Error: {e}]"
    finally:
        if tmp_filename and os.path.exists(tmp_filename): os.remove(tmp_filename)

def verify_test_cases(code, test_cases, case_type="테스트케이스"):
    if not test_cases: return 0, 0, f"❗ 검증할 {case_type}가 없습니다."
    passed_count = 0
    failing_cases_report = []
    for i, (inp, expected_output) in enumerate(test_cases):
        actual_output = run_solve_code_on_input(code, inp)
        is_pass = actual_output.strip() == expected_output.strip()
        
        print(f"  - {case_type} {i+1} ... {'✅ 통과' if is_pass else '❌ 실패'}")
        
        if is_pass:
            passed_count += 1
        else:
            failing_cases_report.append(
                f"- 케이스 {i+1}:\n"
                f"  - 입력:\n{inp}\n"
                f"  - 예상 출력: {expected_output}\n"
                f"  - 실제 출력: {actual_output}"
            )
    return passed_count, len(test_cases), "\n".join(failing_cases_report)

def create_initial_problem_set(algorithm_type, difficulty):
    """CoT 방식으로 완전한 문제 초안을 생성합니다. 실패 시 None을 반환합니다."""
    # Step 1: 아이디어 생성
    print("[단계 1/4] 💡 문제 아이디어 생성 중...")
    step1_response = chain_step1.invoke({"algorithm_type": algorithm_type, "difficulty": difficulty}).content
    problem_title = parse_from_section(step1_response, "문제 제목")
    problem_description = parse_from_section(step1_response, "문제 설명")
    constraints = parse_from_section(step1_response, "제한 사항")
    if not all([problem_title, problem_description, constraints]):
        print("❌ [오류] 단계 1 실패: 문제의 기본 구성요소를 생성하지 못했습니다.")
        return None
    print("✅ 단계 1 완료.")

    # Step 2: 공개 예시 생성
    print("[단계 2/4] 📝 공개 예시 생성 중...")
    step2_response = chain_step2.invoke({"problem_description": problem_description, "constraints": constraints}).content
    public_examples = extract_test_cases(step2_response)
    if not public_examples:
        print("❌ [오류] 단계 2 실패: 공개 예시를 생성하지 못했습니다.")
        return None
    print("✅ 단계 2 완료.")

    # Step 3: 정답 코드 생성
    print("[단계 3/4] 💻 정답 코드 생성 중...")
    step3_response = chain_step3.invoke({"problem_description": problem_description, "public_examples_text": step2_response}).content
    solution_code = extract_solve_code(step3_response)
    if not solution_code:
        print("❌ [오류] 단계 3 실패: 정답 코드를 생성하지 못했습니다.")
        return None
    print("✅ 단계 3 완료.")

    # Step 4: 채점용 '입력' 생성 후 '출력' 계산
    print("[단계 4/4] 🧪 채점용 테스트케이스 생성 중...")
    step4_inputs_response = chain_step4_inputs.invoke({"problem_description": problem_description, "constraints": constraints}).content
    grading_inputs = extract_inputs_only(step4_inputs_response)
    if not grading_inputs:
        print("❌ [오류] 단계 4 실패: 채점용 '입력'을 생성하지 못했습니다.")
        return None
    
    grading_cases = []
    step4_response_text = ""
    for i, inp in enumerate(grading_inputs):
        output = run_solve_code_on_input(solution_code, inp)
        if output.startswith("["): # Runtime Error or Timeout
             print(f"❌ [오류] 단계 4 실패: 생성된 입력값(케이스 {i+1})으로 코드 실행 중 오류 발생 - {output}")
             return None
        grading_cases.append((inp, output))
        step4_response_text += f"입력 {i+1}:\n```\n{inp}\n```\n출력 {i+1}:\n```\n{output}\n```\n\n"

    print("✅ 단계 4 완료.")
    
    return {
        "problem_title": problem_title, "problem_description": problem_description,
        "constraints": constraints, "step2_response": step2_response,
        "public_examples": public_examples, "solution_code": solution_code,
        "step4_response": step4_response_text.strip(), "grading_cases": grading_cases,
    }

# --- 메인 실행 로직 ---
if __name__ == "__main__":
    MAX_ATTEMPTS = 5
    algorithm_type = "다익스트라"
    difficulty = "중간"
    
    print(f"🎯 목표: {algorithm_type} ({difficulty}) 문제 생성")

    # --- 1. 초기 생성 (최대 3회 재시도) ---
    problem_set = None
    for gen_attempt in range(1, 4):
        print(f"\n--- 초기 문제 세트 생성 시도 {gen_attempt}/3 ---")
        problem_set = create_initial_problem_set(algorithm_type, difficulty)
        if problem_set:
            print("--- ✅ 초기 문제 세트 생성 완료 ---")
            break
        elif gen_attempt < 3:
            print("--- ⚠️ 생성 실패. 재시도합니다. ---")
    
    if not problem_set:
        print("\n❌ [치명적 오류] 여러 번 시도했지만 완전한 문제 세트를 생성하는 데 실패했습니다. 프로세스를 중단합니다.")
        exit()

    # --- 2. 검증 및 자동 수정 루프 ---
    is_successful = False
    problem_title = problem_set["problem_title"]
    problem_description = problem_set["problem_description"]
    constraints = problem_set["constraints"]
    step2_response = problem_set["step2_response"]
    public_examples = problem_set["public_examples"]
    solution_code = problem_set["solution_code"]
    step4_response = problem_set["step4_response"]
    grading_cases = problem_set["grading_cases"]

    for attempt in range(1, MAX_ATTEMPTS + 1):
        print(f"\n{'='*25}\n🚀 검증 및 수정 시도 {attempt}/{MAX_ATTEMPTS}\n{'='*25}")

        public_passed, public_total, public_fail_report = verify_test_cases(solution_code, public_examples, "공개 예시")
        
        # 공개 예시 통과 후 채점용 케이스 검증
        if public_passed == public_total:
            print("✅ 공개 예시 모두 통과. 채점용 케이스는 이미 코드로 생성되어 100% 통과가 보장됩니다.")
            is_successful = True
            break
        
        if attempt == MAX_ATTEMPTS: break

        print("\n⚠️ 공개 예시 실패. 자동 수정을 시작합니다.")
        
        correction_response = chain_fix_code.invoke({
            "problem_description": problem_description, "solution_code": solution_code, "error_report": public_fail_report
        }).content
        corrected_code = extract_solve_code(correction_response)
        if not corrected_code:
            print("❌ 코드 수정 실패: AI가 유효한 코드를 반환하지 않았습니다. 프로세스를 중단합니다."); break
        
        print("✅ 정답 코드 수정 완료. 다음 시도에서 재검증합니다.")
        solution_code = corrected_code
        
        # 코드가 바뀌었으므로, 채점용 케이스의 '출력'도 다시 계산
        print("🔄 수정된 코드를 기반으로 채점용 케이스의 출력을 다시 계산합니다...")
        new_grading_cases = []
        new_step4_response_text = ""
        for i, (inp, _) in enumerate(grading_cases):
            output = run_solve_code_on_input(solution_code, inp)
            if output.startswith("["):
                print(f"❌ [오류] 수정된 코드로 출력 재계산 중 오류 발생 (케이스 {i+1}) - {output}")
                new_grading_cases = [] # 재계산 실패 시 리스트 비움
                break
            new_grading_cases.append((inp, output))
            new_step4_response_text += f"입력 {i+1}:\n```\n{inp}\n```\n출력 {i+1}:\n```\n{output}\n```\n\n"
        
        if not new_grading_cases:
            print("❌ 채점용 케이스 출력 재계산 실패. 프로세스를 중단합니다."); break
            
        grading_cases = new_grading_cases
        step4_response = new_step4_response_text.strip()
    
    # --- 3. 최종 결과 출력 ---
    print("\n" + "="*50)
    print("📊 최종 결과")
    print("="*50)
    
    if is_successful:
        print("\n🎉 최종 생성 성공! 모든 테스트케이스를 통과하는 완벽한 문제를 생성했습니다!")
        final_problem_text = (
            f"## 문제 제목\n{problem_title}\n\n"
            f"## 문제 설명\n{problem_description}\n\n"
            f"## 제한 사항\n{constraints}\n\n"
            f"## 예시 입출력\n{parse_from_section(step2_response, '예시 입출력')}\n\n"
            f"## 정답 코드\n```python\n{solution_code}\n```\n\n"
            f"## 채점용 테스트케이스\n{step4_response}"
        )
        print("\n--- 최종 생성된 문제 ---")
        print(final_problem_text)
    else:
        print(f"\n❌ 최종 생성 실패: {MAX_ATTEMPTS}번의 시도 후에도 유효한 문제를 만들지 못했습니다.")
