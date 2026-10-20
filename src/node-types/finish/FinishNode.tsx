import type { NodeComponentProps } from '../../core';
import { NodeCard } from '../../shared/ui/NodeCard';
import type { FinishData } from './schema';

const ACCENT = { border: 'border-emerald-500', header: 'text-emerald-600' };

export function FinishNode({ isRoot, width, height, onDelete }: NodeComponentProps<FinishData>) {
  return (
    <NodeCard title="Flow finished" accent={ACCENT} isRoot={isRoot} width={width} height={height} onDelete={onDelete}>
      <p className="text-xs text-slate-500">End of this branch.</p>
    </NodeCard>
  );
}
