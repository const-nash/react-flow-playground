import { defineNodeType } from '../../core';
import { ConditionNode } from './ConditionNode';
import { conditionSchema, type ConditionData } from './schema';

export const conditionNode = defineNodeType<ConditionData>({
  type: 'condition',
  label: 'Condition',
  role: 'step',
  size: { width: 280, height: 150 },
  schema: conditionSchema,
  defaultData: () => ({ text: '' }),
  children: {
    slots: [
      { id: 'true', label: 'True', tone: 'positive' },
      { id: 'false', label: 'False', tone: 'negative' },
    ],
    // At least one branch is mandatory; removing the last one recreates it in the other branch.
    min: 1,
    defaultChild: 'message',
  },
  component: ConditionNode,
});
