import { isFlowDirty } from '../flows/flow';
import { btn } from '../shared/ui/button';
import { useFlowStore } from '../store/flowStore';

export function FlowList() {
  const flows = useFlowStore((s) => s.flows);
  const saved = useFlowStore((s) => s.saved);
  const currentId = useFlowStore((s) => s.currentId);
  const selectFlow = useFlowStore((s) => s.selectFlow);
  const createFlow = useFlowStore((s) => s.createFlow);

  const list = Object.values(flows).sort((a, b) => a.createdAt - b.createdAt);

  return (
    <section className="flex max-h-[45%] flex-col border-b border-slate-200">
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-sm font-semibold text-slate-800">Flows</h2>
        <button className={btn.default} onClick={createFlow}>
          + New flow
        </button>
      </header>
      <ul className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-3">
        {list.map((flow) => {
          const isSaved = Boolean(saved[flow.id]);
          const dirty = isFlowDirty(flow, saved[flow.id]);
          const active = flow.id === currentId;
          return (
            <li key={flow.id}>
              <button
                onClick={() => selectFlow(flow.id)}
                aria-current={active}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{flow.name.trim() || <i className="text-slate-400">Unnamed</i>}</span>
                {!isSaved ? (
                  <span className="ml-auto shrink-0 rounded bg-slate-200 px-1.5 text-[10px] font-medium text-slate-600 uppercase">
                    New
                  </span>
                ) : (
                  dirty && <span title="Unsaved changes" className="ml-auto size-2 shrink-0 rounded-full bg-amber-500" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
