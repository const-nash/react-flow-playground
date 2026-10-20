import type { Edge, Node } from '@xyflow/react';
import type { LayoutEdge, LayoutNode, TreeNode } from '../core';

export type ContentFlowNode = Node<{ node: TreeNode; isRoot: boolean }, 'content'>;
export type PlusFlowNode = Node<{ parent: TreeNode; slotId: string }, 'plus'>;
export type FlowNode = ContentFlowNode | PlusFlowNode;

const LOCKED = {
  draggable: false,
  connectable: false,
  selectable: false,
  deletable: false,
  focusable: false,
} as const;

const TONE_COLOR = { positive: '#16a34a', negative: '#dc2626' };

export function toFlowNode(n: LayoutNode): FlowNode {
  const common = {
    ...LOCKED,
    id: n.id,
    position: { x: n.x, y: n.y },
    width: n.width,
    height: n.height,
    // React Flow sets `pointer-events: none` on nodes that are neither draggable nor
    // selectable, which makes their controls dead and lets the pane pan "through" them.
    // Re-enable pointer events and mark the node `nopan` so it behaves like a solid card.
    style: { pointerEvents: 'all' as const },
    className: 'nopan',
  };
  return n.kind === 'plus'
    ? { ...common, type: 'plus', data: { parent: n.parent, slotId: n.slotId } }
    : { ...common, type: 'content', data: { node: n.node, isRoot: n.isRoot } };
}

export function toFlowEdge(e: LayoutEdge): Edge {
  return {
    ...LOCKED,
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    reconnectable: false,
    label: e.slot.label,
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 4,
    labelStyle: { fontSize: 11, fontWeight: 600, fill: e.slot.tone ? TONE_COLOR[e.slot.tone] : '#475569' },
    style: e.toPlus ? { strokeDasharray: '4 4' } : undefined,
  };
}
