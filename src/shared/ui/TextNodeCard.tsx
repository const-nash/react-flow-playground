import type { NodeComponentProps } from '../../core';
import { fieldClass } from './field';
import { FieldError, NodeCard, type Accent } from './NodeCard';

type TextData = { text: string };

interface Props extends NodeComponentProps<TextData> {
  title: string;
  placeholder: string;
  accent: Accent;
  maxLength: number;
  monospace?: boolean;
}

/** Node card with a single text field; every keystroke goes straight to the store. */
export function TextNodeCard({ data, errors, onChange, title, placeholder, maxLength, monospace, ...card }: Props) {
  const error = errors.text;

  return (
    <NodeCard title={title} invalid={Boolean(error)} {...card}>
      <textarea
        className={`${fieldClass} nowheel flex-1 resize-none ${monospace ? 'font-mono' : ''} ${error ? '!border-red-400' : ''}`}
        placeholder={placeholder}
        value={data.text}
        onChange={(e) => onChange({ text: e.target.value })}
        aria-invalid={Boolean(error)}
      />
      <div className="flex items-center justify-between gap-2">
        <FieldError message={error} />
        <span className={`ml-auto shrink-0 text-xs ${error ? 'text-red-600' : 'text-slate-400'}`}>
          {data.text.length}/{maxLength}
        </span>
      </div>
    </NodeCard>
  );
}
