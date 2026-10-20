import type { NodeComponentProps } from '../../core';
import { fieldClass } from '../../shared/ui/field';
import { NodeCard, SaveCancel } from '../../shared/ui/NodeCard';
import { useDraft } from '../../shared/ui/useDraft';
import { TRIGGER_TYPE_LABELS, TRIGGER_TYPES, USER_ACTION_LABELS, USER_ACTIONS, type TriggerType, type UserAction } from './options';
import { triggerSchema, type TriggerData, type TriggerDraft } from './schema';

const ACCENT = { border: 'border-violet-400', header: 'text-violet-600' };

const sameTrigger = (a: TriggerDraft, b: TriggerDraft) => a.triggerType === b.triggerType && a.action === b.action;

export function TriggerNode({ data, onSave, ...card }: NodeComponentProps<TriggerData>) {
  const { draft, setDraft, dirty, reset, error, value } = useDraft<TriggerDraft, TriggerData>(
    data,
    triggerSchema,
    sameTrigger,
  );

  return (
    <NodeCard title="Trigger" accent={ACCENT} {...card}>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Trigger type
        <select
          className={`${fieldClass} cursor-pointer`}
          value={draft.triggerType ?? ''}
          // Switching the trigger type invalidates the dependent action.
          onChange={(e) => setDraft({ triggerType: (e.target.value || null) as TriggerType | null, action: null })}
        >
          <option value="">Select…</option>
          {TRIGGER_TYPES.map((t) => (
            <option key={t} value={t}>
              {TRIGGER_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      {draft.triggerType === 'user_action' && (
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Action
          <select
            className={`${fieldClass} cursor-pointer ${dirty && error ? '!border-red-400' : ''}`}
            value={draft.action ?? ''}
            onChange={(e) => setDraft({ ...draft, action: (e.target.value || null) as UserAction | null })}
          >
            <option value="">Select…</option>
            {USER_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {USER_ACTION_LABELS[a]}
              </option>
            ))}
          </select>
        </label>
      )}
      <SaveCancel dirty={dirty} error={error} onSave={() => value && onSave(value)} onCancel={reset} />
    </NodeCard>
  );
}
