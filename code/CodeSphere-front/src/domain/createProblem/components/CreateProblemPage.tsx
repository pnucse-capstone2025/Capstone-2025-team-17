import { DifficultyValue } from '@/domain/createProblem/constants/createProblem.constants';
import NewProblem from '@/domain/createProblem/layout/NewProblem';
import ProblemBuilder from '@/domain/createProblem/layout/ProblemBuilder';
import { postGenerateProblem } from '@/share/api/generator.api';
import { useAuthStore } from '@/share/store/authStore';
import { useMutation } from '@tanstack/react-query';
import { Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// export interface GeneratedProblem {
//   success: boolean;
//   real_pid: number;
//   title: string;
//   description: string;
//   example_io: Array<{ input: string; output: string }>;
//   test_io: Array<{ input: string; output: string }>;
//   solve_code: string;
//   tag: string[];
//   level: number;
//   personalized_level: number;
//   similarity: number;
//   error_report: string;
//   raw_markdown: string;
// }

export interface GeneratedProblem {
  success: boolean;
  solved_count: number;
  real_pid: number;
  title: string;
  body: string;
  input: string;
  output: string;
  problem_constraint: string;
  example_io: ExampleIo[];
  tag: string[];
  level: number;
}

export interface ExampleIo {
  input: string;
  output: string;
}

export interface GenerationRequest {
  algorithm_type: string;
  difficulty: string;
  max_attempts: number;
}

type GeneratePayload = {
  algorithm_type: string; // or 좁은 유니온
  difficulty: 'easy' | 'medium' | 'hard';
  auth: string;
};

export default function CreateProblemPage() {
  const [algorithmType, setAlgorithmType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProblem, setGeneratedProblem] =
    useState<GeneratedProblem | null>(null);
  const [error, setError] = useState('');
  const { accessToken } = useAuthStore();

  const { mutateAsync: generateMutate } = useMutation<
    GeneratedProblem,
    Error,
    GeneratePayload
  >({
    mutationKey: ['generator'],
    mutationFn: (payload) => postGenerateProblem(payload),
  });

  useEffect(() => {
    console.log(algorithmType, difficulty, maxAttempts);
  }, [algorithmType, difficulty, maxAttempts]);

  const handleGenerate = async () => {
    if (!algorithmType || !difficulty) {
      setError('알고리즘 유형과 난이도를 선택해주세요.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedProblem(null);

    try {
      const response = await generateMutate({
        algorithm_type: algorithmType,
        difficulty: difficulty as DifficultyValue,
        auth: accessToken ? accessToken : '',
      });

      // const mockedResponse = getMockResponse({
      //   algorithmType,
      //   difficulty: difficulty as 'easy' | 'medium' | 'hard',
      // });

      // setGeneratedProblem(mockedResponse);
      console.log('Generated Problem:', response);

      setGeneratedProblem(response);
    } catch (e) {
      setError('문제 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedProblem(null);
    setError('');
    setAlgorithmType('');
    setDifficulty('');
    setMaxAttempts(3);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '쉬움':
        return 'bg-green-100 text-green-800';
      case '중간':
        return 'bg-yellow-100 text-yellow-800';
      case '어려움':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {generatedProblem === null ? (
        <>
          <div className="mb-8 text-center">
            <h1 className="mb-2 flex items-center justify-center text-3xl font-bold text-gray-900">
              <Wand2 className="mr-3 h-8 w-8 text-blue-600" />
              AI 문제 생성
            </h1>
            <p className="text-gray-600">
              원하는 알고리즘과 난이도를 선택하면 AI가 맞춤형 문제를
              생성해드립니다!
            </p>
          </div>

          <ProblemBuilder
            algorithmType={algorithmType}
            setAlgorithmType={setAlgorithmType}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            error={error}
            isGenerating={isGenerating}
            handleGenerate={handleGenerate}
          />
        </>
      ) : (
        <NewProblem
          difficulty={difficulty}
          generatedProblem={generatedProblem}
          onReset={handleReset}
          getDifficultyColor={getDifficultyColor}
        />
      )}
    </div>
  );
}
