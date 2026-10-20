import type { z } from 'zod';
import type { NodeComponentProps } from '../../core';
import { fieldClass } from './field';
import { NodeCard, SaveCancel, type Accent } from './NodeCard';
import { useDraft } from './useDraft';

type TextData = { text: string };

interface Props extends NodeComponentProps<TextData> {
  schema: z.ZodType<TextData>;
  title: string;
  placeholder: string;
  accent: Accent;
  monospace?: boolean;
}

/** Node card with a single text field and Save / Cancel. */
export function TextNodeCard({ data, onSave, schema, title, placeholder, monospace, ...card }: Props) {
  const { draft, setDraft, dirty, reset, error, value } = useDraft(data, schema, (a, b) => a.text === b.text);

  return (
    <NodeCard title={title} {...card}>
      <textarea
        className={`${fieldClass} nowheel flex-1 resize-none ${monospace ? 'font-mono' : ''} ${dirty && error ? '!border-red-400' : ''}`}
        placeholder={placeholder}
        value={draft.text}
        onChange={(e) => setDraft({ text: e.target.value })}
      />
      <SaveCancel dirty={dirty} error={error} onSave={() => value && onSave(value)} onCancel={reset} />
    </NodeCard>
  );
}
