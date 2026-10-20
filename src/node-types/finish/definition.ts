import { defineNodeType } from '../../core';
import { FinishNode } from './FinishNode';
import { finishSchema, type FinishData } from './schema';

export const finishNode = defineNodeType<FinishData>({
  type: 'finish',
  label: 'Flow finished',
  role: 'step',
  size: { width: 200, height: 76 },
  schema: finishSchema,
  defaultData: () => ({}),
  // No slots: a terminal node that ends its branch.
  children: { slots: [] },
  component: FinishNode,
});
