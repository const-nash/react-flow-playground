/**
 * Top-down tree layout, independent of any rendering library.
 * "+" placeholders are virtual leaves filling free slots; they never live in state.
 */
import type { ChildSlot, TreeNode } from './definition';
import type { NodeRegistry } from './registry';
import { childInSlot } from './rules';

export const PLUS_SIZE = 36;
const GAP_X = 40;
const GAP_Y = 60;

interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type LayoutNode =
  | (Box & { kind: 'content'; node: TreeNode; isRoot: boolean })
  | (Box & { kind: 'plus'; parent: TreeNode; slotId: string });

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  slot: ChildSlot;
  toPlus: boolean;
}

type Item =
  | { kind: 'content'; node: TreeNode; width: number; height: number }
  | { kind: 'plus'; parent: TreeNode; slotId: string; width: number; height: number };

const itemId = (item: Item) => (item.kind === 'plus' ? `plus:${item.parent.id}:${item.slotId}` : item.node.id);

export function buildLayout(registry: NodeRegistry, nodes: TreeNode[]): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  const root = nodes.find((n) => n.parentId === null);
  if (!root) return { nodes: [], edges: [] };

  const contentItem = (node: TreeNode): Item => ({ kind: 'content', node, ...registry.get(node.type).size });

  const childItems = (item: Item): { slot: ChildSlot; item: Item }[] => {
    if (item.kind === 'plus') return [];
    return registry.get(item.node.type).children.slots.map((slot) => {
      const child = childInSlot(nodes, item.node.id, slot.id);
      return {
        slot,
        item: child
          ? contentItem(child)
          : { kind: 'plus', parent: item.node, slotId: slot.id, width: PLUS_SIZE, height: PLUS_SIZE },
      };
    });
  };

  const widthCache = new Map<string, number>();
  const childrenWidth = (kids: { item: Item }[]) =>
    kids.reduce((sum, k) => sum + subtreeWidth(k.item), 0) + GAP_X * Math.max(0, kids.length - 1);
  const subtreeWidth = (item: Item): number => {
    const id = itemId(item);
    if (!widthCache.has(id)) widthCache.set(id, Math.max(item.width, childrenWidth(childItems(item))));
    return widthCache.get(id)!;
  };

  const outNodes: LayoutNode[] = [];
  const outEdges: LayoutEdge[] = [];

  const place = (item: Item, centerX: number, y: number) => {
    const id = itemId(item);
    const box = { id, x: centerX - item.width / 2, y, width: item.width, height: item.height };
    outNodes.push(
      item.kind === 'plus'
        ? { ...box, kind: 'plus', parent: item.parent, slotId: item.slotId }
        : { ...box, kind: 'content', node: item.node, isRoot: item.node === root },
    );

    const kids = childItems(item);
    let cursor = centerX - childrenWidth(kids) / 2;
    for (const { slot, item: kid } of kids) {
      const w = subtreeWidth(kid);
      place(kid, cursor + w / 2, y + item.height + GAP_Y);
      outEdges.push({ id: `e:${id}->${itemId(kid)}`, source: id, target: itemId(kid), slot, toPlus: kid.kind === 'plus' });
      cursor += w + GAP_X;
    }
  };

  place(contentItem(root), 0, 0);
  return { nodes: outNodes, edges: outEdges };
}
