import { z } from 'zod';
import type { TreeNode } from './definition';
import type { NodeRegistry } from './registry';

const treeNodeShape = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  parentId: z.string().nullable(),
  slot: z.string().nullable(),
  data: z.unknown(),
});

/**
 * Schema for a whole tree (e.g. loaded from storage or a backend):
 * node shape, per-type `data` and every structural rule from the registry.
 */
export function treeSchema(registry: NodeRegistry, options: { rootType?: string } = {}) {
  return z.array(treeNodeShape).superRefine((nodes, ctx) => {
    const issue = (message: string, path: PropertyKey[]) => ctx.addIssue({ code: 'custom', message, path });
    const byId = new Map<string, TreeNode>();
    const childCount = new Map<string, number>();
    const usedSlots = new Set<string>();

    nodes.forEach((n, i) => {
      if (byId.has(n.id)) issue(`Duplicate id "${n.id}"`, [i, 'id']);
      byId.set(n.id, n);
    });

    const roots = nodes.filter((n) => n.parentId === null);
    if (roots.length !== 1) issue(`Expected exactly one root, got ${roots.length}`, []);
    if (options.rootType && roots[0] && roots[0].type !== options.rootType) {
      issue(`Root must be "${options.rootType}"`, [nodes.indexOf(roots[0]), 'type']);
    }

    nodes.forEach((n, i) => {
      let def;
      try {
        def = registry.get(n.type);
      } catch {
        return issue(`Unknown node type "${n.type}"`, [i, 'type']);
      }

      const data = def.schema.safeParse(n.data);
      if (!data.success) {
        for (const e of data.error.issues) issue(e.message, [i, 'data', ...e.path]);
      }

      if (n.parentId === null) {
        if (n.slot !== null) issue('Root must not have a slot', [i, 'slot']);
        return;
      }
      const parent = byId.get(n.parentId);
      if (!parent) return issue(`Parent "${n.parentId}" does not exist`, [i, 'parentId']);
      childCount.set(parent.id, (childCount.get(parent.id) ?? 0) + 1);

      let parentDef;
      try {
        parentDef = registry.get(parent.type);
      } catch {
        return; // reported on the parent itself
      }
      if (!parentDef.children.slots.some((s) => s.id === n.slot)) {
        issue(`"${parent.type}" has no slot "${n.slot}"`, [i, 'slot']);
      }
      const slotKey = `${parent.id}:${n.slot}`;
      if (usedSlots.has(slotKey)) issue(`Slot "${n.slot}" of "${parent.id}" is already taken`, [i, 'slot']);
      usedSlots.add(slotKey);
      if (!registry.allowedChildren(parent.type).some((d) => d.type === n.type)) {
        issue(`"${n.type}" is not allowed under "${parent.type}"`, [i, 'type']);
      }
    });

    nodes.forEach((n, i) => {
      try {
        const min = registry.get(n.type).children.min ?? 0;
        const count = childCount.get(n.id) ?? 0;
        if (count < min) issue(`"${n.type}" needs at least ${min} child(ren), has ${count}`, [i]);
      } catch {
        // unknown type, already reported
      }
    });

    // Every node must hang off the root — catches cycles and detached subtrees.
    if (roots.length === 1) {
      const reachable = new Set([roots[0].id]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const n of nodes) {
          if (n.parentId && reachable.has(n.parentId) && !reachable.has(n.id)) {
            reachable.add(n.id);
            grew = true;
          }
        }
      }
      nodes.forEach((n, i) => !reachable.has(n.id) && issue(`Node "${n.id}" is not reachable from the root`, [i]));
    }
  });
}

export function validateTree(registry: NodeRegistry, input: unknown, options?: { rootType?: string }) {
  return treeSchema(registry, options).safeParse(input);
}
