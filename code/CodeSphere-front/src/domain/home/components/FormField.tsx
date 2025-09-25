import { Input } from '@/share/components/ui/Input';
import { Label } from '@/share/components/ui/Label';

export default function FormField({
  label,
  placeholder,
  fieldId,
  value,
  type,
  handleInputChange,
}: {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
  fieldId: string;
  value: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        type={type || 'text'}
      />
    </div>
  );
}
