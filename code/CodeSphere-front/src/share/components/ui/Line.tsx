export function Line({ width }: { width?: string }) {
  const lineWidth = width ? { width } : 'full';
  return <div className={`w-${lineWidth} h-1 bg-gray-700`} />;
}
