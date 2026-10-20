import { z } from 'zod';
import { create } from 'zustand';
import type { Repository } from '../core/db';
import {
  addChild,
  planRemoval,
  removeSubtree,
  updateData,
  validateTree,
  type RemovalPlan,
  type TreeNode,
} from '../core';
import { createFlow, flowSchema, uniqueFlowName, validateFlow, type Flow } from '../flows/flow';
import { flowRepository } from '../flows/flowRepository';
import { registry, ROOT_TYPE } from '../node-types';

type FlowMap = Record<string, Flow>;

export interface FlowState {
  status: 'loading' | 'ready' | 'error';
  loadError?: string;
  /** Working copies of every flow — temporary, lost on reload unless saved. */
  flows: FlowMap;
  /** Mirror of what is in the database, to tell saved from unsaved. */
  saved: FlowMap;
  currentId: string;
  saving: boolean;
  saveError?: string;
  /** Deletion awaiting confirmation (in the current flow). */
  pendingDelete: { id: string; plan: RemovalPlan } | null;

  /** Loads persisted flows. Without any, the initial unsaved draft stays. */
  init: () => Promise<void>;
  createFlow: () => void;
  selectFlow: (id: string) => void;
  updateMeta: (patch: Partial<Pick<Flow, 'name' | 'description'>>) => void;
  /** Persists the current flow — the only way anything reaches the database. */
  saveCurrent: () => Promise<void>;

  addChild: (parentId: string, slotId: string, type: string) => void;
  /** Rejects data that does not match the node type's schema. */
  updateData: (id: string, data: unknown) => void;
  requestDelete: (id: string) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
}

export function createFlowStore(repository: Repository<Flow>) {
  const initial = createFlow(uniqueFlowName([]));
  let loading: Promise<void> | null = null;

  return create<FlowState>()((set, get) => {
    const current = () => get().flows[get().currentId];
    const setNodes = (update: (nodes: TreeNode[]) => TreeNode[]) =>
      set((s) => {
        const flow = s.flows[s.currentId];
        const nodes = update(flow.nodes);
        return nodes === flow.nodes ? {} : { flows: { ...s.flows, [flow.id]: { ...flow, nodes } } };
      });

    return {
      status: 'loading',
      flows: { [initial.id]: initial },
      saved: {},
      currentId: initial.id,
      saving: false,
      pendingDelete: null,

      init: () =>
        (loading ??= (async () => {
          try {
            const stored = await repository.getAll();
            if (stored.length === 0) return set({ status: 'ready' });
            const map = Object.fromEntries(stored.map((f) => [f.id, f]));
            const latest = stored.reduce((a, b) => (b.updatedAt > a.updatedAt ? b : a));
            set({ status: 'ready', flows: map, saved: map, currentId: latest.id });
          } catch (error) {
            // The unsaved draft stays usable; saving will report the problem.
            set({ status: 'error', loadError: String(error) });
          }
        })()),

      createFlow: () => {
        const flow = createFlow(uniqueFlowName(Object.values(get().flows)));
        set((s) => ({ flows: { ...s.flows, [flow.id]: flow }, currentId: flow.id, pendingDelete: null }));
      },

      selectFlow: (id) => get().flows[id] && set({ currentId: id, pendingDelete: null, saveError: undefined }),

      updateMeta: (patch) => set((s) => ({ flows: { ...s.flows, [s.currentId]: { ...current(), ...patch } } })),

      saveCurrent: async () => {
        const flow = current();
        if (get().saving || !validateFlow(flow, Object.values(get().flows)).valid) return;
        set({ saving: true, saveError: undefined });
        try {
          const toSave = flowSchema.parse({ ...flow, updatedAt: Date.now() });
          await repository.put(toSave);
          set((s) => ({
            saving: false,
            saved: { ...s.saved, [flow.id]: toSave },
            // Keep edits made while saving; otherwise adopt the normalized saved copy.
            flows: s.flows[flow.id] === flow ? { ...s.flows, [flow.id]: toSave } : s.flows,
          }));
        } catch (error) {
          set({ saving: false, saveError: String(error) });
        }
      },

      addChild: (parentId, slotId, type) => setNodes((nodes) => addChild(registry, nodes, parentId, slotId, type)),

      updateData: (id, data) => {
        const node = current().nodes.find((n) => n.id === id);
        if (!node) return;
        const result = registry.get(node.type).schema.safeParse(data);
        if (!result.success) {
          console.error(`Rejected invalid data for "${node.type}" node ${id}\n${z.prettifyError(result.error)}`);
          return;
        }
        setNodes((nodes) => updateData(nodes, id, result.data));
      },

      requestDelete: (id) => {
        const plan = planRemoval(registry, current().nodes, id);
        if (plan) set({ pendingDelete: { id, plan } });
      },

      confirmDelete: () => {
        const pending = get().pendingDelete;
        if (!pending) return;
        setNodes((nodes) => removeSubtree(registry, nodes, pending.id));
        set({ pendingDelete: null });
      },

      cancelDelete: () => set({ pendingDelete: null }),
    };
  });
}

export const useFlowStore = createFlowStore(flowRepository);

export const selectCurrentFlow = (s: FlowState) => s.flows[s.currentId];

// In development, assert after every change that the current tree still satisfies all structural rules.
if (import.meta.env?.DEV) {
  useFlowStore.subscribe((state, prev) => {
    const nodes = selectCurrentFlow(state).nodes;
    if (nodes === selectCurrentFlow(prev)?.nodes) return;
    const result = validateTree(registry, nodes, { rootType: ROOT_TYPE });
    if (!result.success) console.error(`Flow tree invariant broken\n${z.prettifyError(result.error)}`);
  });
}
