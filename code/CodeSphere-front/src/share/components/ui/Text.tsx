type TextElement = 'p' | 'div' | 'h1' | 'h2' | 'h3';

export default function Text({
  children,
  as,
}: {
  children: React.ReactNode;
  as?: TextElement;
}) {
  const Component = as || 'p';
  return (
    <Component className={`${textStyle(Component)}`}>{children}</Component>
  );
}

const textStyle = (as: TextElement) => {
  switch (as) {
    case 'h1':
      return 'text-4xl font-bold text-gray-800';
    case 'h2':
      return 'text-2xl font-semibold';
    case 'h3':
      return 'text-xl font-medium';
    case 'p':
      return 'text-base';
    case 'div':
      return '';
    default:
      return '';
  }
};
