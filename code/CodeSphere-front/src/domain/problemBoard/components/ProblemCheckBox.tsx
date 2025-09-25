import { Checkbox } from '@/share/components/ui/Checkbox';
import { memo } from 'react';

export default memo(function ProblemCheckBox({
  tag,
  label,
  checked,
  onChange,
}: {
  tag: string;
  checked: boolean;
  label: string;
  onChange?: () => void;
}) {
  console.log(tag, checked, label, onChange);
  return (
    <>
      <Checkbox id={tag} checked={checked} onCheckedChange={onChange} />
      <label htmlFor={tag} className="cursor-pointer text-sm text-gray-700">
        {label}
      </label>
    </>
  );
});
