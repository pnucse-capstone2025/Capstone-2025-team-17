import { LevelTag } from './LevelTag';

interface ProblemItemProps {
  //   id: string; // 문제 고유 ID - 필요해지면 추가
  title: string;
  level: 1 | 2 | 3; // 난이도: level1~3
  accuracy: number; // 정답률: 0 ~ 100 (%)
}

export function ProblemItem({ title, level, accuracy }: ProblemItemProps) {
  return (
    <tr className="flex w-full gap-4 border-b-1 border-gray-200 px-8 py-4 text-center">
      <td className="w-9/12 text-start text-black">{title}</td>
      <td className="w-1/12">{`${accuracy}%`}</td>
      <LevelTag level={level} />
    </tr>
  );
}
