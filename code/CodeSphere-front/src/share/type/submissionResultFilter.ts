export type SubmissionResultFilter =
  | 'PASS'
  | 'FAIL'
  | 'TLE'
  | 'RTE'
  | 'MLE'
  | 'CE';

export const SubmissionResultFilterLabels: Record<
  SubmissionResultFilter,
  string
> = {
  PASS: '정답',
  FAIL: '오답',
  TLE: '시간 초과',
  RTE: '런타임 에러',
  MLE: '메모리 초과',
  CE: '컴파일 에러',
};
