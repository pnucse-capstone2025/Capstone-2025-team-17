type valueColorType = 'blue' | 'green' | 'purple';

export function DailyStatsItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: valueColorType;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`font-semibold ${valueStyle(color)}`}>{value}</span>
    </div>
  );
}

const valueStyle = (color: valueColorType) => {
  switch (color) {
    case 'blue':
      return 'text-blue-600';
    case 'green':
      return 'text-green-600';
    case 'purple':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
};
