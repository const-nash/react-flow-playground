import { defineNodeType } from '../../core';
import { triggerSchema, type TriggerDraft } from './schema';
import { TriggerNode } from './TriggerNode';

export const triggerNode = defineNodeType<TriggerDraft>({
  type: 'trigger',
  label: 'Trigger',
  // Entry point: only ever the root, never offered in the "+" menu.
  role: 'entry',
  size: { width: 280, height: 200 },
  schema: triggerSchema,
  defaultData: () => ({ triggerType: null, action: null }),
  children: { slots: [{ id: 'next' }] },
  component: TriggerNode,
});
