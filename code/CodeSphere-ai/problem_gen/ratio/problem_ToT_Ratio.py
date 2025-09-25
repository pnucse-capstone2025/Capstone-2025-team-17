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

# ============================
# 벤치마크: 알고리즘별 생성 성공률
# ============================

def try_generate_problem(algorithm_type: str, difficulty: str, k: int = 3) -> bool:
    """
    기존 파이프라인을 '조용히' 한 번 실행하고,
    모든 단계가 성공적으로 끝나면 True, 중간에 실패하면 False 반환.
    (콘솔 출력/exit 없이 예외를 내부에서 처리)
    """
    try:
        # 1-A. 초안 k개 생성
        thoughts_response = chain_generate_thoughts.invoke({
            "k": k,
            "algorithm_type": algorithm_type,
            "difficulty": difficulty
        }).content
        code_drafts = extract_code_drafts(thoughts_response, k)
        if not code_drafts:
            return False

        # 1-B. 초안 평가 및 최고 점수 코드 선택
        best_code, highest_score = None, -1
        for draft in code_drafts:
            eval_response = chain_evaluate_thought.invoke({
                "code_draft": draft,
                "algorithm_type": algorithm_type
            }).content
            clean = re.sub(r'```json\s*|\s*```', '', eval_response).strip()
            eval_json = json.loads(clean)
            score = int(eval_json.get("score", 0))
            if score > highest_score:
                highest_score, best_code = score, draft
        if not best_code:
            return False

        solution_code = best_code

        # 1-C. 스토리 아이디어 3개 생성
        ideas_response = chain_ideas.invoke({"solution_code": solution_code}).content
        story_ideas = extract_story_ideas(ideas_response)
        if not story_ideas:
            return False

        # 2. 테스트 입력 12개 생성
        step2_response_text = chain_inputs.invoke({"solution_code": solution_code}).content
        all_inputs = extract_inputs_only(step2_response_text)
        if not all_inputs or len(all_inputs) < 12:
            return False

        # 3. 모든 입력에 대해 코드 실행 (런타임 에러/타임아웃 검사)
        all_test_pairs = []
        for inp in all_inputs:
            out = run_solve_code_on_input(solution_code, inp)
            if out.startswith("["):  # [Runtime Error], [Timeout], [Execution Error: ...]
                return False
            all_test_pairs.append((inp, out))

        # 4. 최종 문제 설명 생성 및 필수 섹션 확인
        chosen_idea = random.choice(story_ideas)
        public_examples = all_test_pairs[:2]
        public_examples_text = ""
        for i, (inp, out) in enumerate(public_examples):
            public_examples_text += f"입력 {i+1}:\n```\n{inp}\n```\n출력 {i+1}:\n```\n{out}\n```\n\n"

        final_problem_text_raw = chain_description.invoke({
            "story_idea": chosen_idea,
            "solution_code": solution_code,
            "public_examples_text": public_examples_text.strip(),
            "algorithm_type": algorithm_type
        }).content

        title = parse_section_from_text(final_problem_text_raw, "문제 제목")
        desc = parse_section_from_text(final_problem_text_raw, "문제 설명")
        cons = parse_section_from_text(final_problem_text_raw, "제한 사항")
        if not all([title, desc, cons]):
            return False

        return True

    except Exception:
        # 어떤 단계에서든 예외가 나면 실패로 처리
        return False


if __name__ == "__main__":
    # 벤치마크 대상 알고리즘과 반복 횟수 설정
    algorithms = algorithms = ["DFS", "BFS", "Binary Search", "Dynamic Programming", "Greedy Algorithm", "Topological Sort", "Union-Find", "Two Pointer", "Sliding Window", "Backtracking", "Dijkstra"]
    difficulty = "medium"
    NUM_RUNS = 3  # 알고리즘별 시도 횟수

    print("📊 알고리즘별 문제 생성 성공률 벤치마크")
    print(f"(difficulty={difficulty}, k=3, runs={NUM_RUNS})\n")

    print(f"{'알고리즘':<20}{'성공률(%)':>12}")
    print("-" * 32)

    for algo in algorithms:
        success = 0
        for _ in range(NUM_RUNS):
            ok = try_generate_problem(algo, difficulty, k=3)
            if ok:
                success += 1
        rate = (success / NUM_RUNS) * 100
        print(f"{algo:<20}{rate:>12.1f}")
