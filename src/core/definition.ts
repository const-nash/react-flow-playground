import type { ComponentType } from 'react';
import type { z } from 'zod';

/** A position under a parent. Each slot holds at most one child. */
export interface ChildSlot {
  id: string;
  /** Shown on the edge leading to the slot. */
  label?: string;
  tone?: 'positive' | 'negative';
}

export interface ChildRules {
  /** Ordered child positions; `slots.length` is the max number of children. */
  slots: ChildSlot[];
  /** Real (non-"+") children the node must always have. Defaults to 0. */
  min?: number;
  /** Allowed child types. Defaults to every registered type with role `step`. */
  allowed?: string[];
  /** Type auto-created to satisfy `min`. Required when `min > 0`. */
  defaultChild?: string;
}

/** Validation messages keyed by field path (`'action'`, `'a.b'`; `''` for the value itself). */
export type FieldErrors = Record<string, string>;

/** What a node type's component receives. Plugins know nothing about React Flow or the store. */
export interface NodeComponentProps<Data> {
  data: Data;
  /** Problems that would block saving the flow; shown inline, never block editing. */
  errors: FieldErrors;
  isRoot: boolean;
  width: number;
  height: number;
  /** Writes straight to the working copy in the store. */
  onChange: (data: Data) => void;
  /** Absent for nodes that cannot be deleted (the root). */
  onDelete?: () => void;
}

/**
 * `Data` is the editable shape kept in state while the user works — it may be incomplete.
 * `schema` decides whether it is good enough to be saved to the database.
 */
export interface NodeTypeDefinition<Data = any> {
  type: string;
  label: string;
  /** `entry` types can only be the root; `step` types can be added via "+". */
  role: 'entry' | 'step';
  size: { width: number; height: number };
  /** Rules `data` must satisfy for the flow to be saved. Defaults must pass it too. */
  schema: z.ZodType<Data>;
  defaultData: () => Data;
  children: ChildRules;
  component: ComponentType<NodeComponentProps<Data>>;
}

/** Identity helper that infers `Data` and keeps the component's props in sync with it. */
export const defineNodeType = <Data>(def: NodeTypeDefinition<Data>): NodeTypeDefinition<Data> => def;

/** A node as stored in state. Plain JSON — safe to persist or send to a backend. */
export interface TreeNode {
  id: string;
  type: string;
  parentId: string | null;
  /** Which of the parent's slots this node occupies. `null` for the root. */
  slot: string | null;
  data: unknown;
}
