# 생성형 인공지능을 기반으로 한 알고리즘 학습 플랫폼 구현

## 1. 프로젝트 배경
정부의 '**디지털 인재양성 종합방안**'에 따라 2025년부터 초·중등 코딩 교육이 전면 확대되었다. 정보 교과 시수가 초등 34시간, 중등 68시간 이상으로 2배 이상 증가하면서, 공교육 현장에서의 효과적인 알고리즘 학습 보조 도구에 대한 수요가 폭발적으로 증가할 전망이다. 하지만 '백준', '프로그래머스'와 같은 기존 온라인 저지(OJ) 플랫폼들은 학습자가 문제 풀이 중 막혔을 때 즉각적인 피드백을 제공하지 못한다. 이로 인해 학습자는 문제 해결을 위해 외부 검색에 의존하게 되어 학습 흐름이 단절되고, 정적인 해설은 개인의 현재 코드 상태나 사고 과정을 반영하지 못하는 한계가 있다. 또한, 획일적인 문제 목록은 사용자의 실력이나 취약점을 고려하지 않아 체계적인 성장을 저해하는 요인이 되었다.

**CodeSphere**는 이러한 문제점을 해결하기 위해, 학습자 개개인에 최적화된 지속 가능한 알고리즘 학습 생태계를 구축하는 것을 목표로 한다. 최신 생성형 AI 기술을 통해 학습 과정에서 마주하는 장애물을 제거하고, 개인의 학습 데이터를 심층 분석하여 맞춤형 학습 경로를 제시함으로써 학습 효율을 극대화하고 코딩에 대한 흥미를 유지시키는 새로운 패러다임을 제안한다.

<br>

## 2. 개발 목표
### 2.1. 목표 및 세부 내용
본 과제의 최종 목표는 기존 학습 플랫폼의 한계를 극복하는 '**AI 기반 개인 맞춤형 알고리즘 학습 플랫폼**'을 구현하는 것으로, 이를 위해 다음과 같은 세 가지 핵심 기능을 개발하였다.

- **생성형 AI 기반 '힌트 제공' 기능**: 사용자가 문제 풀이 중 어려움을 겪을 때, 단순히 정답을 알려주는 것이 아니라 문제의 맥락과 사용자의 실시간 코드를 분석하여 다음 단계로 나아갈 수 있도록 유도하는 RAG(검색 증강 생성) 기반의 상황인지형 힌트를 제공
  
- **사용자 풀이 기반 '문제 추천 시스템'** 기능: 사용자의 정답률, 풀이 시간, 힌트 사용 빈도 등 학습 데이터를 분석하여 개인의 취약점을 파악합니다. 이를 바탕으로 콜드 스타트 문제를 고려한 하이브리드 추천 시스템이 개인의 성장에 가장 도움이 되는 맞춤형 문제를 제시
  
- **생성형 AI 기반 '문제 생성' 기능**: 특정 알고리즘 유형이나 난이도에 맞춰 새로운 문제를 동적으로 생성합니다. ToT(Tree-of-Thoughts) 및 자체 검증 파이프라인을 통해 생성된 문제의 논리적 일관성을 보장하며, 무한한 학습 기회를 제공

### 2.2. 기존 서비스 대비 차별성 
기존 온라인 저지 플랫폼이 정적인 '문제 은행' 역할에 그치는 반면, CodeSphere는 학습자 개개인과 상호작용하는 'AI 튜터' 역할을 지향한다. 사용자가 힌트, 추천, 생성을 하나의 플랫폼 내에서 완결된 흐름으로 경험하게 함으로써, 외부 검색으로 인한 학습 흐름의 단절을 막고 높은 몰입도를 유지시키는 것이 핵심 차별점이다. 기술적으로도 단순 LLM 호출을 넘어, RAG 및 ToT와 같은 기법을 적용하여 생성되는 콘텐츠의 신뢰성과 품질을 보장하는 데 중점을 두었다.

<br>

## 3. 시스템 설계
### 3.1. 시스템 구성도
<p align="center"><img width="452" height="292" alt="image" src="https://github.com/user-attachments/assets/55931806-2ef0-47b3-b2f3-8c3370c68a98" /></p>

본 시스템은 **MSA(마이크로서비스 아키텍처)** 를 기반으로 설계되었다. 서버의 메인 Nginx가 리버스 프록시 역할을 수행하며, FastAPI를 API 게이트웨이로 사용하여 각 기능별 Flask 마이크로서비스(채점, 힌트, 추천, 문제 생성)를 효율적으로 관리한다. 이를 통해 각 서비스의 독립적인 개발, 배포, 확장이 가능하도록 구성했다.

### 3.2. 사용 기술
- Frontend: React, Vite, TypeScript, Tailwind CSS, Zustand
  - 컴포넌트 기반 아키텍처와 강력한 생태계를 통해 복잡한 UI를 효율적으로 구축
  - TypeScript와 Zustand를 통해 코드의 안정성과 상태 관리의 편의성을 확보

- Backend: Python, FastAPI (API Gateway), Flask (Microservices), Gunicorn
  - FastAPI는 비동기 처리를 통한 높은 성능으로 API 게이트웨이에 적합
  - 각 기능별로 가볍고 독립적인 Flask 서버를 구성하여 MSA의 장점을 극대화함.

- Database: PostgreSQL
  - 높은 안정성과 SQL 표준 준수, 그리고 JSONB 및 pgvector와 같은 확장 기능을 통해 복잡한 데이터 구조와 AI 기반 벡터 검색을 효율적으로 처리할 수 있음.

- AI: Dify, Langchain, OpenAI(GPT-4o), Sentence-Transformers
  - Dify를 통해 RAG 및 에이전트 파이프라인을 신속하게 프로토타이핑하고, Langchain으로 복잡한 AI 로직을 유연하게 구성함

<br>

## 4. 개발 결과
### 4.1. 전체 시스템 흐름도
사용자가 브라우저를 통해 도메인에 접속하면, 서버의 메인 Nginx가 해당 요청을 받는다. Nginx는 API 관련 경로( /problems, /hints 등)는 FastAPI로, 그 외 모든 요청은 React 정적 파일(index.html)로 전달하는 리버스 프록시 역할을 수행한다. FastAPI는 인증 처리 후, 직접 DB와 통신하거나 필요에 따라 각 기능에 맞는 Flask 마이크로서비스(힌트 생성, 채점 등)에 내부적으로 요청을 보내 결과를 받아 사용자에게 최종 응답한다.

### 4.2. 기능 설명 및 주요 기능 명세서

1. RAG 기반 상황인지형 AI 힌트 시스템 **(/hints/request)**

- 상세 설명: 사용자의 현재 학습 맥락을 가장 깊이 이해하고 맞춤형 피드백을 제공하는 핵심 기능이다. 정적인 해설 대신, 사용자의 코드와 문제 정보를 실시간으로 분석하여 "다음 단계로 나아가기 위한" 동적인 힌트를 생성한다.
  
- 입력 (Input):
  - real_pid (int): 현재 풀고 있는 문제의 고유 ID
  - user_code (string): 사용자가 IDE에 작성한 현재 소스 코드
  - user_id (int): (인증 토큰에서 추출)
    
- 처리 과정 (Process):
  - FastAPI는 real_pid로 DB에서 문제의 모든 정보(설명, 입출력, 태그, 난이도 등)를 조회한다.
  - 조회된 문제 정보와 입력받은 user_code를 AI 서버(Dify 에이전트)에 전달한다.
  - AI 에이전트는 RAG 파이프라인을 통해 지식 베이스(알고리즘 서적, 논문)를 참조하여, 전달받은 모든 컨텍스트를 종합해 가장 적절한 힌트를 생성한다.
    
- 출력 (Output):
  - hint (string): 생성된 맞춤형 힌트 텍스트

<br>

2. 하이브리드 문제 추천 시스템 **(/problems/recommend_problems)**

- 상세 설명: 모든 사용자에게 개인화된 학습 경로를 제공하기 위해, 사용자의 학습 데이터 양에 따라 추천 전략을 동적으로 변경한다.

- 입력 (Input):
  - user_id (int): (인증 토큰에서 추출)

- 처리 과정 (Process):
  - 사용자의 누적 풀이 문제 수를 확인한다.
  - Cold Start (10문제 미만): 사용자가 최근에 푼 문제와 동일한 태그를 가진 문제, 또는 전체 사용자에게 인기가 많은 문제를 우선적으로 추천한다.
  - Active User (10문제 이상): 사용자가 푼 문제들의 벡터 평균으로 '사용자 실력 벡터'를 계산하고, 아직 풀지 않은 문제들과의 코사인 유사도를 기반으로 가장 관련성 높은 문제를 추천한다.

- 출력 (Output):
  - List[Problem] : 추천된 문제 객체의 리스트
 
<br>

3. 자체 검증 AI 문제 생성기 **(/generator/generate)**

- 상세 설명: LLM의 환각 현상을 최소화하고 논리적 일관성을 보장하기 위해, 다단계 검증 파이프라인을 통해 고품질의 새로운 알고리즘 문제를 생성한다.

- 입력 (Input):
  - algorithm_type (string): 생성할 문제의 알고리즘 유형 (예: "Dijkstra")
  - difficulty (string): 생성할 문제의 난이도 (예: "Hard")

- 처리 과정 (Process):
  - (ToT) 코드 생성 및 평가: 여러 개의 정답 코드 초안을 생성하고, 자체 평가를 통해 가장 우수한 코드를 선정한다.
  - 테스트케이스 생성: 선정된 코드를 기반으로 다양한 입출력 테스트케이스를 생성한다.
  - 자체 검증: 생성된 모든 테스트케이스를 코드로 직접 실행하여 논리적 모순이 없는지 검증한다.
  - 문제 결합: 검증이 완료된 데이터와 스토리를 결합하여 하나의 완성된 문제를 생성한다.

- 출력 (Output):
  - Problem (object): 생성된 문제의 모든 정보 (제목, 본문, 입출력, 정답 코드 등)

<br>

### 4.3. 디렉토리 구조
프로젝트는 MSA 설계를 반영하여, 기능 및 역할에 따라 CodeSphere-back, CodeSphere-ai, CodeSphere-front의 세 개 독립된 Git 레포지토리로 구성되어 있다.

```
.
├── 📂 CodeSphere-back/
│   ├── 📂 app/             # FastAPI API Gateway
│   ├── 📂 judge_service/   # 채점 Flask 서버
│   └── 📂 recommend_service/ # 추천 Flask 서버
│
├── 📂 CodeSphere-ai/
│   ├── 📂 hint/            # 힌트 생성 Flask 서버
│   └── 📂 problem_gen/     # 문제 생성 Flask 서버
│
└── 📂 CodeSphere-front/
    ├── 📂 src/             # React 소스 코드
    └── ...
```

## 5. 설치 및 실행 방법
### 5.1. 설치절차 및 실행 방법
> 설치 명령어 및 준비 사항, 실행 명령어, 포트 정보 등
### 5.2. 오류 발생 시 해결 방법
> 선택 사항, 자주 발생하는 오류 및 해결책 등

<br>

## 6. 소개 자료 및 시연 영상
### 6.1. 프로젝트 소개 자료
> 추후 첨부 예정
### 6.2. 시연 영상
> 추후 삽입 예정

<br>

## 7. 팀 구성
### 7.1. 팀원별 소개 및 역할 분담

| <p align="center">Profile</p> | <p align="center">Role</p>| <p align="center">Email</p> | <p align="center">GitHub</p> |
|:------:|:------------------------------------|:------|:--------|
| <p align="center"><img src="https://github.com/TrioDW.png?size=80" width="80"/><br/><strong>김대욱</strong></p> | <p align="center">Team Leader / Backend Developer</p> | <p align="center">kdu5233@pusan.ac.kr</p> | <p align="center">[@TrioDW](https://github.com/TrioDW)</p> |
| <p align="center"><img src="https://github.com/mun-kyeong.png?size=80" width="80"/><br/><strong>김문경</strong></p> | <p align="center">Frontend Developer</p> | <p align="center">horse6953@pusan.ac.kr</p> | <p align="center">[@mun-kyeong](https://github.com/mun-kyeong)</p> |
| <p align="center"><img src="https://github.com/maureen272.png?size=80" width="80"/><br/><strong>김진우</strong></p> | <p align="center">AI Developer</p> | <p align="center">maureen272@pusan.ac.kr</p> | <p align="center">[@maureen272](https://github.com/maureen272)</p> |

### 7.2. 팀원 별 참여 후기
> 개별적으로 느낀 점, 협업, 기술적 어려움 극복 사례 등

<br>

## 8. 참고 문헌 및 출처
- Lewis, Patrick, et al. "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks." Advances in Neural Information Processing Systems, 33 (2020): 9459-9474.
- Wei, Jason, et al. "Chain-of-thought prompting elicits reasoning in large language models." Advances in Neural Information Processing Systems, 35 (2022): 24824-24837.
