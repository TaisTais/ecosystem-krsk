import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  renderButtonLabel?: (value: T) => ReactNode;
};

const Dropdown = <T extends string,>({
  value,
  options,
  onChange,
  buttonClassName = '',
  menuClassName = '',
  optionClassName = '',
  renderButtonLabel,
}: Props<T>) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={buttonClassName}
      >
        <span className="truncate">
          {renderButtonLabel ? renderButtonLabel(value) : current?.label}
        </span>
        <ChevronDown size={16} className="shrink-0 text-current opacity-70" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 mt-2 min-w-56 rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden z-50 ${menuClassName}`}>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-gray-50 ${optionClassName}`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check size={16} className="text-emerald-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dropdown;