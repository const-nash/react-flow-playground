import type { NodeComponentProps } from '../../core';
import { fieldClass } from '../../shared/ui/field';
import { FieldError, NodeCard } from '../../shared/ui/NodeCard';
import { TRIGGER_TYPE_LABELS, TRIGGER_TYPES, USER_ACTION_LABELS, USER_ACTIONS, type TriggerType, type UserAction } from './options';
import type { TriggerDraft } from './schema';

const ACCENT = { border: 'border-violet-400', header: 'text-violet-600' };

export function TriggerNode({ data, errors, onChange, ...card }: NodeComponentProps<TriggerDraft>) {
  const actionError = errors.action;

  return (
    <NodeCard title="Trigger" accent={ACCENT} invalid={Object.keys(errors).length > 0} {...card}>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Trigger type
        <select
          className={`${fieldClass} cursor-pointer`}
          value={data.triggerType ?? ''}
          // Switching the trigger type invalidates the dependent action.
          onChange={(e) => onChange({ triggerType: (e.target.value || null) as TriggerType | null, action: null })}
        >
          <option value="">Select…</option>
          {TRIGGER_TYPES.map((t) => (
            <option key={t} value={t}>
              {TRIGGER_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      {data.triggerType === 'user_action' && (
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Action
          <select
            className={`${fieldClass} cursor-pointer ${actionError ? '!border-red-400' : ''}`}
            value={data.action ?? ''}
            onChange={(e) => onChange({ ...data, action: (e.target.value || null) as UserAction | null })}
            aria-invalid={Boolean(actionError)}
          >
            <option value="">Select…</option>
            {USER_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {USER_ACTION_LABELS[a]}
              </option>
            ))}
          </select>
          <FieldError message={actionError} />
        </label>
      )}
    </NodeCard>
  );
}
