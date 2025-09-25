interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

export interface SubmissionResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  testCases: TestCase[];
  executionTime?: string;
  memoryUsage?: string;
}
export const submissionResultMock: SubmissionResult = {
  passed: true,
  totalTests: 5,
  passedTests: 5,
  executionTime: '0.001s',
  memoryUsage: '2.1MB',
  testCases: [
    {
      input: '1 2',
      expectedOutput: '3',
      actualOutput: '3',
      passed: true,
    },
    {
      input: '3 4',
      expectedOutput: '7',
      actualOutput: '7',
      passed: true,
    },
    {
      input: '5 6',
      expectedOutput: '11',
      actualOutput: '11',
      passed: true,
    },
    {
      input: '9 1',
      expectedOutput: '10',
      actualOutput: '10',
      passed: true,
    },
    {
      input: '0 0',
      expectedOutput: '0',
      actualOutput: '0',
      passed: true,
    },
  ],
};
