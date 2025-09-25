interface MockResponseParams {
  algorithmType: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function getMockResponse({
  algorithmType,
  difficulty,
}: MockResponseParams) {
  return {
    success: true,
    real_pid: 1234,
    title: `${algorithmType} 기반 문제`,
    description: `이 문제는 ${algorithmType} 알고리즘을 사용하여 해결할 수 있는 ${difficulty} 난이도의 문제입니다.\n\n주어진 조건에 따라 최적의 해답을 찾아보세요.`,
    example_io: [
      { input: '5\n1 2 3 4 5', output: '15' },
      { input: '3\n10 20 30', output: '60' },
    ],
    test_io: [
      { input: '5\n1 2 3 4 5', output: '15' },
      { input: '3\n10 20 30', output: '60' },
      { input: '4\n2 4 6 8', output: '20' },
      { input: '1\n100', output: '100' },
    ],
    solve_code: `def solution():
    n = int(input())
    numbers = list(map(int, input().split()))

    # ${algorithmType} 알고리즘 구현
    result = sum(numbers)
    print(result)

solution()`,
    tag: [algorithmType, '구현', difficulty],
    level: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
    personalized_level:
      difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
    similarity: 0.85,
    error_report: '',
    raw_markdown: `# ${algorithmType} 기반 문제\n\n## 문제 설명\n${algorithmType} 알고리즘을 사용하여 해결하는 문제입니다.`,
  };
}
