import { AlertCircle, CheckCircle, Circle } from 'lucide-react';

export default function getStatusIcon(status: string) {
  switch (status) {
    case 'solved':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'attempted':
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case 'unsolved':
      return <Circle className="h-4 w-4 text-gray-400" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
}
