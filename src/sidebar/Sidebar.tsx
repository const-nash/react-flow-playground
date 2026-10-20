import { useState, type CSSProperties } from 'react';
import { FlowDetails } from './FlowDetails';
import { FlowList } from './FlowList';

/** Floating panel on the right; the toggle stays on screen and the panel slides out of view. */
export function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <div
      // Panel width; the wrapper slides by exactly this much (+ gap) so only the toggle remains visible.
      style={{ '--panel': 'min(20rem, calc(100vw - 5rem))' } as CSSProperties}
      className={`pointer-events-none fixed inset-y-4 right-4 z-20 flex items-start gap-2 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        open ? 'translate-x-0' : 'translate-x-[calc(var(--panel)+0.5rem)]'
      }`}
    >
      <button
        type="button"
        aria-label={open ? 'Hide sidebar' : 'Show sidebar'}
        aria-expanded={open}
        title={open ? 'Hide sidebar' : 'Show sidebar'}
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-slate-200 bg-white/85 text-slate-600 shadow-lg backdrop-blur-md transition-colors hover:text-blue-600"
      >
        <svg
          viewBox="0 0 24 24"
          className={`size-5 transition-transform duration-500 ${open ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
      <aside
        inert={!open}
        className={`pointer-events-auto flex h-full w-(--panel) flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/85 shadow-2xl backdrop-blur-md transition-[opacity,scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <FlowList />
        <FlowDetails />
      </aside>
    </div>
  );
}
