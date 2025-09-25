export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-gray-400">
      <svg
        className="mb-4 h-16 w-16 text-gray-300"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="text-lg font-semibold">문제 정보를 찾을 수 없습니다.</div>
      <div className="mt-2 text-sm">문제가 삭제되었거나 존재하지 않습니다.</div>
    </div>
  );
}
