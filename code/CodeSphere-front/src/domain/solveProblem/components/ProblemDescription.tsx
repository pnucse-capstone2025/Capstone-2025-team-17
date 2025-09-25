export default function ProblemDescription({
  label,
  description,
}: {
  label?: string;
  description?: string;
}) {
  return (
    <div>
      <h3 className="mb-2 font-semibold">{label}</h3>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
}
