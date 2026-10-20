import type { ReactNode } from 'react';

export interface Accent {
  /** Tailwind classes for the card border and the header text. */
  border: string;
  header: string;
}

interface Props {
  title: string;
  isRoot: boolean;
  width: number;
  height: number;
  accent: Accent;
  /** Highlights the card when its data would block saving the flow. */
  invalid?: boolean;
  onDelete?: () => void;
  children: ReactNode;
}

/** Common node shell: header with title and an optional delete button. */
export function NodeCard({ title, isRoot, width, height, accent, invalid, onDelete, children }: Props) {
  return (
    <div
      style={{ width, height }}
      className={`flex cursor-default flex-col gap-2 rounded-xl border bg-white p-2.5 shadow-sm transition-shadow ${
        invalid ? 'border-red-400 ring-2 ring-red-200' : accent.border
      }`}
    >
      <div className={`flex items-center justify-between text-xs font-semibold tracking-wide uppercase ${accent.header}`}>
        <span>{isRoot ? `${title} (root)` : title}</span>
        {onDelete && (
          <button title="Delete node" className="cursor-pointer px-1.5 text-slate-400 hover:text-red-600" onClick={onDelete}>
            ✕
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/** Inline validation message under a field. */
export function FieldError({ message }: { message?: string }) {
  return message ? <span className="truncate text-xs text-red-600" title={message}>{message}</span> : null;
}
