import { SubmissionResult } from '@/share/api/submissions.api';

export function formatConsoleResult(data: SubmissionResult) {
  const passRate = data.total > 0 ? `${data.passed}/${data.total}` : 'N/A';

  if (!data || !data.result) {
    return '결과를 가져올 수 없습니다.';
  }

  const output = [
    '================== 📜 실행 결과 ==================',
    `🎯 결과       : ${data.result}`,
    `✅ 통과       : ${passRate}`,
    `⏰ 실행 시간   : ${data.runtime_ms} ms`,
    `💾 메모리      : ${data.memory_kb} KB`,
    '==================================================',
  ];

  // 테스트 케이스 결과 추가
  data.testCases.forEach((tc, idx) => {
    output.push(
      `\n[테스트 케이스 ${idx + 1}]`,
      `입력값       : ${tc.input}`,
      `기댓값       : ${tc.expectedOutput}`,
      `실제 출력    : ${tc.actualOutput}`,
      `결과         : ${tc.passed ? '✅ 통과' : '❌ 실패'}`,
    );
  });

  return output.join('\n');
}
