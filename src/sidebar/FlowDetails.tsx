import { useMemo } from 'react';
import { FLOW_DESCRIPTION_MAX, isFlowDirty, validateFlow } from '../flows/flow';
import { btn } from '../shared/ui/button';
import { fieldClass } from '../shared/ui/field';
import { selectCurrentFlow, useFlowStore } from '../store/flowStore';

export function FlowDetails() {
  const flow = useFlowStore(selectCurrentFlow);
  const flows = useFlowStore((s) => s.flows);
  const saved = useFlowStore((s) => s.saved[s.currentId]);
  const saving = useFlowStore((s) => s.saving);
  const saveError = useFlowStore((s) => s.saveError);
  const loadError = useFlowStore((s) => s.loadError);
  const updateMeta = useFlowStore((s) => s.updateMeta);
  const saveCurrent = useFlowStore((s) => s.saveCurrent);

  const validation = useMemo(() => validateFlow(flow, Object.values(flows)), [flow, flows]);
  const dirty = isFlowDirty(flow, saved);

  const status = saving ? 'Saving…' : !saved ? 'Not saved yet' : dirty ? 'Unsaved changes' : 'All changes saved';

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Name
        <input
          className={`${fieldClass} ${validation.name ? '!border-red-400' : ''}`}
          value={flow.name}
          onChange={(e) => updateMeta({ name: e.target.value })}
          aria-invalid={Boolean(validation.name)}
        />
        {validation.name && <span className="font-normal text-red-600">{validation.name}</span>}
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        <span>
          Description <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <textarea
          className={`${fieldClass} h-20 resize-none ${validation.description ? '!border-red-400' : ''}`}
          value={flow.description}
          onChange={(e) => updateMeta({ description: e.target.value })}
          aria-invalid={Boolean(validation.description)}
        />
        <span className={`self-end font-normal ${validation.description ? 'text-red-600' : 'text-slate-400'}`}>
          {flow.description.trim().length}/{FLOW_DESCRIPTION_MAX}
        </span>
      </label>

      <div className="text-xs text-slate-400">
        ID <code className="font-mono break-all text-slate-500 select-all">{flow.id}</code>
      </div>

      {validation.tree.length > 0 ? (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          <p className="mb-1 font-semibold">Flow is not valid yet</p>
          <ul className="list-disc space-y-0.5 pl-4">
            {validation.tree.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : (
        validation.valid && <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Flow is valid</div>
      )}

      {(saveError || loadError) && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs break-words text-red-700">
          {saveError ? `Save failed: ${saveError}` : `Could not load saved flows: ${loadError}`}
        </div>
      )}

      <footer className="mt-auto flex items-center justify-between gap-2 pt-2">
        <span className={`text-xs ${dirty && !saving ? 'text-amber-600' : 'text-slate-400'}`}>{status}</span>
        <button
          className={btn.primary}
          disabled={!dirty || !validation.valid || saving}
          title={!validation.valid ? 'Only valid flows can be saved' : undefined}
          onClick={() => void saveCurrent()}
        >
          Save flow
        </button>
      </footer>
    </section>
  );
}
