import { ExampleIo } from '@/share/type/problem';

export default function ProblemExamples({
  index,
  example,
}: {
  index: number;
  example: ExampleIo;
}) {
  return (
    <div key={index} className="mb-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="mb-1 text-sm font-medium">예제 입력 {index + 1}</h4>
          <div className="rounded bg-gray-100 p-2 font-mono text-sm whitespace-pre">
            {example.input}
          </div>
        </div>
        <div>
          <h4 className="mb-1 text-sm font-medium">예제 출력 {index + 1}</h4>
          <div className="overflow-auto rounded bg-gray-100 p-2 font-mono text-sm whitespace-pre">
            {example.output}
          </div>
        </div>
      </div>
    </div>
  );
}
