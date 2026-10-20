import { Handle, Position, type NodeProps } from '@xyflow/react';
import { registry } from '../node-types';
import { useFlowStore } from '../store/flowStore';
import { hiddenHandle } from './handles';
import type { ContentFlowNode } from './toReactFlow';

/** Adapter between React Flow and a node type's plugin component. */
export function ContentNode({ data: { node, isRoot } }: NodeProps<ContentFlowNode>) {
  const updateData = useFlowStore((s) => s.updateData);
  const requestDelete = useFlowStore((s) => s.requestDelete);
  const { component: Component, size, children } = registry.get(node.type);

  return (
    <>
      {!isRoot && <Handle type="target" position={Position.Top} isConnectable={false} className={hiddenHandle} />}
      <Component
        data={node.data}
        isRoot={isRoot}
        width={size.width}
        height={size.height}
        onSave={(data) => updateData(node.id, data)}
        onDelete={isRoot ? undefined : () => requestDelete(node.id)}
      />
      {children.slots.length > 0 && (
        <Handle type="source" position={Position.Bottom} isConnectable={false} className={hiddenHandle} />
      )}
    </>
  );
}
