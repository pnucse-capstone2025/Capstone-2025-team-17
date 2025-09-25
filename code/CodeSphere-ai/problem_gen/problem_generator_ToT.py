import os
import re
import json
import tempfile
import subprocess
import random
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence

# --- 환경 변수 및 LLM 설정 ---
# .env 파일이 있다면 해당 경로를 지정해주세요.
# load_dotenv("/path/to/your/.env")

# 사용자의 편의를 위해 API 키를 직접 입력받도록 수정
try:
    load_dotenv() 
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise ValueError
except (FileNotFoundError, ValueError):
    OPENAI_API_KEY = input("OpenAI API 키를 입력해주세요: ")

llm = ChatOpenAI(
    model="gpt-4o",
    api_key=OPENAI_API_KEY,
)

# --- 프롬프트 정의 (ToT + Beam Search 방식) ---

# 1-A. 여러 생각(코드 초안) 생성 프롬프트
prompt_generate_thoughts = PromptTemplate.from_template("""
You are an ensemble of expert Python programmers. Your task is to generate {k} diverse and high-quality Python `solve()` functions for the **{algorithm_type}** algorithm.
Each implementation must be a valid, logical, and self-contained function that reads from standard input.

**Your Task:**
Generate {k} distinct code drafts. Each draft must be a complete `solve()` function within its own markdown block.

**Example Output for k=2:**
## Draft 1
```python
import sys

def solve():
    input = sys.stdin.readline
    # First implementation approach...
```

## Draft 2
```python
import sys
from collections import deque

def solve():
    input = sys.stdin.readline
    # A different implementation approach...
```

**Now, generate {k} drafts for the {algorithm_type} algorithm:**
""")

# 1-B. 생각(코드 초안) 평가 프롬프트 (평가 기준 강화)
prompt_evaluate_thought = PromptTemplate.from_template("""
You are a Senior Software Engineer acting as a meticulous code reviewer.
Your task is to evaluate a given Python code draft based on several criteria and provide a score.

**Code Draft to Evaluate:**
```python
{code_draft}
```

**Evaluation Criteria:**
1.  **Correctness (Weight: 40%)**: Does the code correctly implement the **{algorithm_type}** algorithm? Is it free of logical bugs?
2.  **Standard I/O (Weight: 30%)**: **(CRITICAL)** Does the code properly read from standard input (e.g., `sys.stdin.readline`, `input()`)? Code with hardcoded data instead of reading input must be heavily penalized.
3.  **Efficiency (Weight: 20%)**: Is the implementation efficient in terms of time and space complexity?
4.  **Clarity (Weight: 10%)**: Is the code clean, readable, and well-commented?

**Your Task:**
Provide a score from 0 (worst) to 100 (best) based on the weighted criteria. Your response must be a valid JSON object with two keys: "score" (integer) and "reasoning" (a brief explanation for your score).

**Your JSON Response:**
""")

# 1-C. 스토리 아이디어 생성 프롬프트
prompt_step1c_ideas = PromptTemplate.from_template("""
You are a creative writer. Based on the provided correct Python code, generate 3 creative story themes.
**Correct Solution Code:**
```python
{solution_code}
```
**Output Format (You MUST follow this format):**
## 스토리 아이디어
- **테마 1:** (A one-line idea)
- **테마 2:** (A different idea)
- **테마 3:** (An original idea)
""")

# 2. 채점용 '입력' 데이터 생성 (Few-shot 예시 수정)
prompt_step2_inputs = PromptTemplate.from_template("""
You are an expert QA tester. Your task is to analyze the Python code below and generate 12 diverse 'input' values.

**Code to Analyze:**
```python
{solution_code}
```

**Instructions:**
1.  Carefully read the code to understand the exact input format it expects (e.g., number of nodes, edges on multiple lines, and then a start node on the final line).
2.  Generate 12 diverse test inputs. Include simple cases, edge cases, and general cases.
3.  **CRITICAL**: Your response MUST start with `## 테스트케이스 입력` and follow the format exactly as shown in the example. Do NOT add any introductory text, explanations, or summaries.

**Example of the required output format for a Dijkstra problem:**
## 테스트케이스 입력
입력 1:
```
5 7
1 2 2
1 3 5
1 4 1
2 3 3
2 4 2
3 4 3
3 5 1
1
```
입력 2:
```
4 4
1 2 1
1 3 4
2 4 2
3 4 1
2
```

**Your Output (for the provided code):**
""")

# 3. 최종 문제 설명 생성 (프롬프트 강화)
prompt_step3_description = PromptTemplate.from_template("""
You are a world-class problem-setter. Your task is to create a complete and engaging algorithm problem by combining the components provided below.

### Components
1.  **Selected Story Theme:** {story_idea}
2.  **Core Logic (Reference Solution Code):**
    ```python
    {solution_code}
    ```
3.  **I/O Examples for the User:**
    {public_examples_text}

### Your Mission
- Write a compelling story based on the 'Selected Story Theme'.
- Clearly define the problem, input format, and output format.
- Infer and specify reasonable constraints for the input values.
- **Prohibition**: You MUST NOT directly mention the algorithm's name ('{algorithm_type}').

### Output Format (CRITICAL!)
Your response MUST contain all the following headers, in this exact order. Do NOT add any other text or explanations.

## 문제 제목
(A creative title that fits the story)

## 문제 설명
(A detailed description of the story and the problem)

## 입력
(Description of the input data format)

## 출력
(Description of the output data format)

## 제한 사항
(The inferred constraints, e.g., 1 <= N <= 100,000)

**Your Final Problem Description:**
""")

# --- 실행 체인 정의 ---
chain_generate_thoughts = prompt_generate_thoughts | llm
chain_evaluate_thought = prompt_evaluate_thought | llm
chain_ideas = prompt_step1c_ideas | llm
chain_inputs = prompt_step2_inputs | llm
chain_description = prompt_step3_description | llm

# --- 파싱 및 실행 헬퍼 함수 ---
def extract_code_drafts(text_block, k):
    drafts = []
    for i in range(1, k + 1):
        match = re.search(rf"## Draft {i}\s*```python\s*(.*?)```", text_block, re.DOTALL)
        if match:
            drafts.append(match.group(1).strip())
    return drafts

def parse_section_from_text(text, header):
    """헤더를 기반으로 특정 섹션을 파싱하는 안정적인 함수입니다."""
    pattern = re.compile(rf"## {re.escape(header)}\s*(.*?)(?=\n## |\Z)", re.DOTALL)
    match = pattern.search(text)
    return match.group(1).strip() if match else ""

def extract_story_ideas(text_block):
    idea_section = parse_section_from_text(text_block, "스토리 아이디어")
    if not idea_section: return []
    ideas = [parts[1].strip() for line in idea_section.split('\n') if ':' in line and len(parts := line.split(":", 1)) > 1 and parts[1].strip()]
    return ideas

def extract_inputs_only(text_block):
    return [match.strip() for match in re.findall(r"입력 \d+:\s*```(?:\w*\n)?(.*?)```", text_block, re.DOTALL)]

def run_solve_code_on_input(code, test_input):
    full_code = code 
    if "def solve():" in full_code:
        full_code += "\n\nif __name__ == '__main__':\n    solve()\n"
    
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

# --- 메인 실행 로직 ---
if __name__ == "__main__":
    algorithm_type = "Dijkstra"
    difficulty = "Hard"
    BEAM_WIDTH = 3
    
    print(f"🎯 목표: {algorithm_type} ({difficulty}) 문제 생성 (ToT + Beam Search 방식, k={BEAM_WIDTH})")

    # --- 1. ToT를 이용한 최적의 코드 생성 ---
    best_code = None
    highest_score = -1

    print(f"\n[1-A단계] 🧠 {BEAM_WIDTH}개의 다양한 코드 초안(생각) 생성 중...")
    thoughts_response = chain_generate_thoughts.invoke({
        "k": BEAM_WIDTH,
        "algorithm_type": algorithm_type,
        "difficulty": difficulty
    }).content
    code_drafts = extract_code_drafts(thoughts_response, BEAM_WIDTH)

    if not code_drafts:
        print("❌ [오류] 1-A단계 실패: 코드 초안을 생성하지 못했습니다. 중단합니다.")
        exit()

    print(f"\n[1-B단계] 🧐 생성된 {len(code_drafts)}개의 초안을 평가하여 최적의 코드를 선택합니다...")
    for i, draft in enumerate(code_drafts):
        print(f"  - 초안 {i+1} 평가 중...")
        try:
            eval_response = chain_evaluate_thought.invoke({
                "code_draft": draft,
                "algorithm_type": algorithm_type
            }).content
            clean_json_response = re.sub(r'```json\s*|\s*```', '', eval_response).strip()
            eval_result = json.loads(clean_json_response)
            score = eval_result.get("score", 0)
            reasoning = eval_result.get("reasoning", "N/A")
            print(f"    - 점수: {score}, 이유: {reasoning}")

            if score > highest_score:
                highest_score = score
                best_code = draft
        except Exception as e:
            print(f"    - ⚠️ 초안 {i+1} 평가 중 오류 발생: {e}")
            continue
    
    if not best_code:
        print("\n❌ [오류] 1-B단계 실패: 모든 초안을 평가하지 못했거나 유효한 코드가 없습니다. 중단합니다.")
        exit()
    
    solution_code = best_code
    print(f"\n✅ 1단계 완료. 최고 점수({highest_score}점)를 받은 코드를 최종 선택했습니다.")

    # --- 1-C. 스토리 아이디어 생성 ---
    print("\n[1-C단계] ✍️ 확정된 코드를 바탕으로 스토리 아이디어 생성 중...")
    ideas_response = chain_ideas.invoke({"solution_code": solution_code}).content
    story_ideas = extract_story_ideas(ideas_response)
    if not story_ideas:
        print("\n❌ [오류] 1-C단계 실패: 스토리 아이디어를 생성하지 못했습니다. 중단합니다.")
        exit()
    print("✅ 1-C단계 완료.")

    # --- 2. 다양한 입력값 생성 ---
    print("\n[2단계] 🧪 코드 분석을 통한 테스트 입력값 생성 중...")
    step2_response_text = chain_inputs.invoke({"solution_code": solution_code}).content
    all_inputs = extract_inputs_only(step2_response_text)
    if not all_inputs or len(all_inputs) < 12:
        print(f"❌ [오류] 2단계 실패: 충분한 테스트 입력값({len(all_inputs)}/12개)을 생성하지 못했습니다. 중단합니다.")
        exit()
    print("✅ 2단계 완료.")

    # --- 3. 생성된 코드로 모든 출력값 계산 ---
    print("\n[3단계] 🔢 모든 입력에 대한 정답 출력 계산 중...")
    all_test_cases = []
    for i, inp in enumerate(all_inputs):
        output = run_solve_code_on_input(solution_code, inp)
        if output.startswith("["):
            print(f"❌ [오류] 3단계 실패: 코드 실행 중 오류 발생 (입력 {i+1}) - {output}")
            exit()
        all_test_cases.append((inp, output))
    public_examples = all_test_cases[:2]
    grading_cases = all_test_cases[2:]
    print("✅ 3단계 완료.")

    # --- 4. 최종 문제 설명 생성 (안정적인 파싱 로직 적용) ---
    print("\n[4단계] 📖 최종 문제 설명, 제약 조건 등 생성 중...")
    chosen_idea = random.choice(story_ideas)
    public_examples_text = ""
    for i, (inp, out) in enumerate(public_examples):
        public_examples_text += f"입력 {i+1}:\n```\n{inp}\n```\n출력 {i+1}:\n```\n{out}\n```\n\n"
    final_problem_text_raw = chain_description.invoke({
        "story_idea": chosen_idea, "solution_code": solution_code,
        "public_examples_text": public_examples_text.strip(), "algorithm_type": algorithm_type
    }).content
    
    problem_title = parse_section_from_text(final_problem_text_raw, "문제 제목")
    problem_description = parse_section_from_text(final_problem_text_raw, "문제 설명")
    problem_input_desc = parse_section_from_text(final_problem_text_raw, "입력")
    problem_output_desc = parse_section_from_text(final_problem_text_raw, "출력")
    problem_constraints = parse_section_from_text(final_problem_text_raw, "제한 사항")

    if not all([problem_title, problem_description, problem_constraints]):
        print("❌ [오류] 4단계 실패: 최종 문제 설명을 완성하지 못했습니다. 중단합니다.")
        print("---------- LLM 최종 설명 응답 (디버깅용) ----------")
        print(final_problem_text_raw)
        print("-------------------------------------------------")
        exit()
    print("✅ 4단계 완료.")
    
    # --- 5. 최종 결과 취합 및 출력 ---
    print("\n" + "="*50)
    print("🎉 생성 성공! 모든 구성요소가 준비되었습니다.")
    print("="*50)
    grading_cases_text = ""
    for i, (inp, out) in enumerate(grading_cases):
        grading_cases_text += f"입력 {i+1}:\n```\n{inp}\n```\n출력 {i+1}:\n```\n{out}\n```\n\n"
    final_output = f"""
# ==================================================
#                  알고리즘 문제
# ==================================================
## 문제 제목
{problem_title}
## 문제 설명
{problem_description}
## 입력
{problem_input_desc}
## 출력
{problem_output_desc}
## 제한 사항
{problem_constraints}
## 예시 입출력
{public_examples_text.strip()}
# ==================================================
#              Solution and Test Cases
# ==================================================
## 정답 코드
```python
{solution_code}
```
## 채점용 테스트케이스
{grading_cases_text.strip()}
"""
    print(final_output)