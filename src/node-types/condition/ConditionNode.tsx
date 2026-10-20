import type { NodeComponentProps } from '../../core';
import { TextNodeCard } from '../../shared/ui/TextNodeCard';
import { conditionSchema, type ConditionData } from './schema';

const ACCENT = { border: 'border-amber-400', header: 'text-amber-600' };

export function ConditionNode(props: NodeComponentProps<ConditionData>) {
  return (
    <TextNodeCard
      {...props}
      schema={conditionSchema}
      title="Condition"
      placeholder="e.g. user.age >= 18"
      accent={ACCENT}
      monospace
    />
  );
}
