/** Structural rules: which children a node may / must have and where. */
import type { ChildSlot, TreeNode } from './definition';
import type { NodeRegistry } from './registry';

export const childrenOf = (nodes: TreeNode[], parentId: string): TreeNode[] =>
  nodes.filter((n) => n.parentId === parentId);

export const childInSlot = (nodes: TreeNode[], parentId: string, slotId: string): TreeNode | undefined =>
  nodes.find((n) => n.parentId === parentId && n.slot === slotId);

export function freeSlots(registry: NodeRegistry, nodes: TreeNode[], parent: TreeNode): ChildSlot[] {
  return registry.get(parent.type).children.slots.filter((s) => !childInSlot(nodes, parent.id, s.id));
}

export function canAttach(
  registry: NodeRegistry,
  nodes: TreeNode[],
  parent: TreeNode,
  slotId: string,
  type: string,
): boolean {
  return (
    freeSlots(registry, nodes, parent).some((s) => s.id === slotId) &&
    registry.allowedChildren(parent.type).some((d) => d.type === type)
  );
}

/**
 * Slots that must be filled so `parent` satisfies its `min`.
 * Slots other than `vacatedSlotId` win, so deleting the only "True" child refills "False" and vice versa.
 */
export function slotsToFill(
  registry: NodeRegistry,
  nodes: TreeNode[],
  parent: TreeNode,
  vacatedSlotId?: string | null,
): ChildSlot[] {
  const missing = (registry.get(parent.type).children.min ?? 0) - childrenOf(nodes, parent.id).length;
  if (missing <= 0) return [];
  const free = freeSlots(registry, nodes, parent);
  const ordered = [...free.filter((s) => s.id !== vacatedSlotId), ...free.filter((s) => s.id === vacatedSlotId)];
  return ordered.slice(0, missing);
}

/** Types without slots can never have children: they end a branch. */
export const isTerminalType = (registry: NodeRegistry, type: string): boolean =>
  registry.get(type).children.slots.length === 0;

/** Leaves that are not terminal, i.e. branches that do not end properly yet. */
export function openLeaves(registry: NodeRegistry, nodes: TreeNode[]): TreeNode[] {
  const parents = new Set(nodes.map((n) => n.parentId));
  return nodes.filter((n) => !parents.has(n.id) && !isTerminalType(registry, n.type));
}
