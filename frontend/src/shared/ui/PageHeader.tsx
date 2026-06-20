import type { ReactNode } from 'react';

type Props = {
  title?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
};

const PageHeader = ({ title, leftSlot, rightSlot, className = '' }: Props) => {
  return (
    <div className={`px-4 py-3 sticky top-0 z-50 bg-white border-b ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">{leftSlot ?? (title ? <h1 className="text-xl font-semibold truncate">{title}</h1> : null)}</div>
        <div className="shrink-0">{rightSlot}</div>
      </div>
    </div>
  );
};

export default PageHeader;