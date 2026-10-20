import type { ReactNode } from 'react';
import { btn } from './button';

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
  onDelete?: () => void;
  children: ReactNode;
}

/** Common node shell: header with title and an optional delete button. */
export function NodeCard({ title, isRoot, width, height, accent, onDelete, children }: Props) {
  return (
    <div
      style={{ width, height }}
      className={`flex cursor-default flex-col gap-2 rounded-xl border bg-white p-2.5 shadow-sm ${accent.border}`}
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

interface SaveCancelProps {
  dirty: boolean;
  /** Validation message; disables Save while present. */
  error?: string;
  onSave: () => void;
  onCancel: () => void;
}

export function SaveCancel({ dirty, error, onSave, onCancel }: SaveCancelProps) {
  return (
    <div className="mt-auto flex items-center justify-end gap-1.5">
      {dirty && error && <span className="mr-auto truncate text-xs text-red-600" title={error}>{error}</span>}
      <button className={btn.default} disabled={!dirty} onClick={onCancel}>
        Cancel
      </button>
      <button className={btn.primary} disabled={!dirty || !!error} onClick={onSave}>
        Save
      </button>
    </div>
  );
}
