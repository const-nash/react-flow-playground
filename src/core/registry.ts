import { z } from 'zod';
import type { NodeTypeDefinition } from './definition';

export interface NodeRegistry {
  get(type: string): NodeTypeDefinition;
  /** Definitions that may be attached as children of `parentType`. */
  allowedChildren(parentType: string): NodeTypeDefinition[];
}

/** Builds the registry and validates cross-references between node types up front. */
export function createRegistry(definitions: NodeTypeDefinition[]): NodeRegistry {
  const byType = new Map(definitions.map((d) => [d.type, d]));
  if (byType.size !== definitions.length) throw new Error('Duplicate node type in registry');

  const get = (type: string) => {
    const def = byType.get(type);
    if (!def) throw new Error(`Unknown node type "${type}"`);
    return def;
  };

  const stepTypes = definitions.filter((d) => d.role === 'step').map((d) => d.type);
  const allowed = new Map(definitions.map((d) => [d.type, (d.children.allowed ?? stepTypes).map(get)]));

  for (const def of definitions) {
    const { slots, min = 0, defaultChild } = def.children;
    const defaults = def.schema.safeParse(def.defaultData());
    if (!defaults.success) throw new Error(`"${def.type}": invalid defaultData\n${z.prettifyError(defaults.error)}`);
    if (min > slots.length) throw new Error(`"${def.type}": min children exceeds slot count`);
    if (min > 0 && !allowed.get(def.type)!.some((d) => d.type === defaultChild)) {
      throw new Error(`"${def.type}": defaultChild must be one of the allowed child types`);
    }
  }

  return { get, allowedChildren: (parentType) => allowed.get(get(parentType).type)! };
}
