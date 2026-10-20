import { useEffect } from 'react';
import { registry } from '../node-types';
import { btn } from '../shared/ui/button';
import { useFlowStore } from '../store/flowStore';

/** "Are you sure?" dialog for the deletion pending in the store. */
export function ConfirmDialog() {
  const pending = useFlowStore((s) => s.pendingDelete);
  const confirm = useFlowStore((s) => s.confirmDelete);
  const cancel = useFlowStore((s) => s.cancelDelete);

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending, cancel]);

  if (!pending) return null;
  const { descendants, replacements } = pending.plan;

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-900/40" onClick={cancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-[min(360px,calc(100vw-32px))] rounded-xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-semibold text-slate-800">Are you sure?</h3>
        {descendants > 0 ? (
          <p className="mb-4 text-slate-600">
            This node has <b>{descendants}</b> descendant node{descendants === 1 ? '' : 's'} (recursively). They will
            all be deleted together with it.
          </p>
        ) : (
          <p className="mb-4 text-slate-600">This node will be deleted.</p>
        )}
        {replacements.map(({ slot, type }) => (
          <p key={slot.id} className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            The parent must keep at least one child, so an empty <b>{registry.get(type).label}</b> will be added
            {slot.label && (
              <>
                {' '}
                to the <b>{slot.label}</b> branch
              </>
            )}
            .
          </p>
        ))}
        <div className="flex justify-end gap-2">
          <button className={btn.default} onClick={cancel} autoFocus>
            Cancel
          </button>
          <button className={btn.danger} onClick={confirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
