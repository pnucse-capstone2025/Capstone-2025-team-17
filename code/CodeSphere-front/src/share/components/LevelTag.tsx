interface LevelTagProps {
  level: 1 | 2 | 3;
}

export function LevelTag({ level }: LevelTagProps) {
  let bgColor = '';

  if (level === 1) {
    bgColor = 'bg-green-200';
  } else if (level === 2) {
    bgColor = 'bg-yellow-200';
  } else if (level === 3) {
    bgColor = 'bg-red-200';
  }

  return (
    <td className={`rounded-md ${bgColor} px-2 py-1 text-xs text-gray-800`}>
      {`난이도 ${level}`}
    </td>
  );
}
