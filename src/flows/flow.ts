import { z } from 'zod';
import { createTree, openLeaves, treeSchema, type TreeNode } from '../core';
import { registry, ROOT_TYPE } from '../node-types';

export const FLOW_NAME_MAX = 60;
export const FLOW_DESCRIPTION_MAX = 300;

const normalizeName = (name: string) => name.trim().toLocaleLowerCase();

/**
 * A flow that may be persisted: valid metadata, a structurally valid tree,
 * and every branch ending with a terminal node ("Flow finished").
 */
export const flowSchema = z
  .object({
    id: z.string().min(1),
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(FLOW_NAME_MAX, `Name must be at most ${FLOW_NAME_MAX} characters`),
    description: z.string().trim().max(FLOW_DESCRIPTION_MAX, `At most ${FLOW_DESCRIPTION_MAX} characters`),
    nodes: treeSchema(registry, { rootType: ROOT_TYPE }),
    createdAt: z.number().int(),
    updatedAt: z.number().int(),
  })
  .superRefine((flow, ctx) => {
    for (const leaf of openLeaves(registry, flow.nodes)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Branch must end with "Flow finished"',
        path: ['nodes', flow.nodes.indexOf(leaf)],
      });
    }
  });

export type Flow = z.infer<typeof flowSchema>;

export function createFlow(name: string): Flow {
  const now = Date.now();
  return { id: crypto.randomUUID(), name, description: '', nodes: createTree(registry, ROOT_TYPE), createdAt: now, updatedAt: now };
}

/** First "Untitled flow", "Untitled flow 2", … not taken by `flows`. */
export function uniqueFlowName(flows: Flow[], base = 'Untitled flow'): string {
  const taken = new Set(flows.map((f) => normalizeName(f.name)));
  for (let i = 1; ; i++) {
    const name = i === 1 ? base : `${base} ${i}`;
    if (!taken.has(normalizeName(name))) return name;
  }
}

export interface FlowValidation {
  valid: boolean;
  name?: string;
  description?: string;
  /** Problems inside the tree, prefixed with the node they belong to. */
  tree: string[];
}

/** Validates `flow` for saving; names must be unique across `allFlows`. */
export function validateFlow(flow: Flow, allFlows: Flow[]): FlowValidation {
  const takenNames = new Set(allFlows.filter((f) => f.id !== flow.id).map((f) => normalizeName(f.name)));
  const result = flowSchema
    .superRefine((f, ctx) => {
      if (takenNames.has(normalizeName(f.name))) {
        ctx.addIssue({ code: 'custom', message: 'A flow with this name already exists', path: ['name'] });
      }
    })
    .safeParse(flow);

  const validation: FlowValidation = { valid: result.success, tree: [] };
  if (result.success) return validation;

  for (const issue of result.error.issues) {
    const [field, index] = issue.path;
    if (field === 'name' || field === 'description') {
      validation[field] ??= issue.message;
    } else if (field === 'nodes') {
      const node = typeof index === 'number' ? flow.nodes[index] : undefined;
      validation.tree.push(node ? `${nodeLabel(node)}: ${issue.message}` : issue.message);
    } else {
      validation.tree.push(issue.message);
    }
  }
  validation.tree = [...new Set(validation.tree)];
  return validation;
}

function nodeLabel(node: TreeNode): string {
  try {
    return registry.get(node.type).label;
  } catch {
    return node.type;
  }
}

/** Whether `flow` differs from what is stored (`saved` is undefined for never-saved flows). */
export function isFlowDirty(flow: Flow, saved: Flow | undefined): boolean {
  if (!saved) return true;
  return (
    flow.name !== saved.name ||
    flow.description !== saved.description ||
    (flow.nodes !== saved.nodes && JSON.stringify(flow.nodes) !== JSON.stringify(saved.nodes))
  );
}
