/** Pure operations on the node list. Every function returns a new array. */
import type { ChildSlot, TreeNode } from './definition';
import type { NodeRegistry } from './registry';
import { canAttach, childrenOf, slotsToFill } from './rules';

export const ROOT_ID = 'root';

const createNode = (registry: NodeRegistry, type: string, parentId: string | null, slot: string | null): TreeNode => ({
  id: parentId === null ? ROOT_ID : crypto.randomUUID(),
  type,
  parentId,
  slot,
  data: registry.get(type).defaultData(),
});

/** Adds `node` plus, recursively, any children its rules require. */
function insertWithRequired(registry: NodeRegistry, nodes: TreeNode[], node: TreeNode): TreeNode[] {
  let result = [...nodes, node];
  const childType = registry.get(node.type).children.defaultChild!;
  for (const slot of slotsToFill(registry, result, node)) {
    result = insertWithRequired(registry, result, createNode(registry, childType, node.id, slot.id));
  }
  return result;
}

export function createTree(registry: NodeRegistry, rootType: string): TreeNode[] {
  return insertWithRequired(registry, [], createNode(registry, rootType, null, null));
}

/** All descendant ids of a node (recursive, not including the node itself). */
export function descendantIds(nodes: TreeNode[], id: string): string[] {
  const result: string[] = [];
  const stack = [id];
  while (stack.length) {
    const current = stack.pop()!;
    for (const child of childrenOf(nodes, current)) {
      result.push(child.id);
      stack.push(child.id);
    }
  }
  return result;
}

export function addChild(
  registry: NodeRegistry,
  nodes: TreeNode[],
  parentId: string,
  slotId: string,
  type: string,
): TreeNode[] {
  const parent = nodes.find((n) => n.id === parentId);
  if (!parent || !canAttach(registry, nodes, parent, slotId, type)) return nodes;
  return insertWithRequired(registry, nodes, createNode(registry, type, parentId, slotId));
}

export interface RemovalPlan {
  descendants: number;
  /** Children the parent gets back to keep satisfying its `min`. */
  replacements: { slot: ChildSlot; type: string }[];
}

function withoutSubtree(nodes: TreeNode[], id: string): TreeNode[] {
  const toRemove = new Set([id, ...descendantIds(nodes, id)]);
  return nodes.filter((n) => !toRemove.has(n.id));
}

/** `null` when the node cannot be removed (unknown, or the root). */
export function planRemoval(registry: NodeRegistry, nodes: TreeNode[], id: string): RemovalPlan | null {
  const target = nodes.find((n) => n.id === id);
  const parent = target?.parentId ? nodes.find((n) => n.id === target.parentId) : undefined;
  if (!target || !parent) return null;
  const type = registry.get(parent.type).children.defaultChild!;
  return {
    descendants: descendantIds(nodes, id).length,
    replacements: slotsToFill(registry, withoutSubtree(nodes, id), parent, target.slot).map((slot) => ({ slot, type })),
  };
}

/** Removes a node with its whole subtree, then refills the parent if its rules require it. */
export function removeSubtree(registry: NodeRegistry, nodes: TreeNode[], id: string): TreeNode[] {
  const plan = planRemoval(registry, nodes, id);
  if (!plan) return nodes;
  const parentId = nodes.find((n) => n.id === id)!.parentId!;
  let result = withoutSubtree(nodes, id);
  for (const { slot, type } of plan.replacements) {
    result = insertWithRequired(registry, result, createNode(registry, type, parentId, slot.id));
  }
  return result;
}

export function updateData(nodes: TreeNode[], id: string, data: unknown): TreeNode[] {
  return nodes.some((n) => n.id === id) ? nodes.map((n) => (n.id === id ? { ...n, data } : n)) : nodes;
}
