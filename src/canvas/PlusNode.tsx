import { useEffect, useRef, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { PLUS_SIZE } from '../core';
import { registry } from '../node-types';
import { useFlowStore } from '../store/flowStore';
import { hiddenHandle } from './handles';
import type { PlusFlowNode } from './toReactFlow';

export function PlusNode({ data: { parent, slotId } }: NodeProps<PlusFlowNode>) {
  const addChild = useFlowStore((s) => s.addChild);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close, true);
    return () => document.removeEventListener('pointerdown', close, true);
  }, [open]);

  return (
    <div className="relative" style={{ width: PLUS_SIZE, height: PLUS_SIZE }} ref={ref}>
      <Handle type="target" position={Position.Top} isConnectable={false} className={hiddenHandle} />
      <button
        title="Add node"
        className="flex size-full cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-slate-400 bg-white text-xl leading-none text-slate-500 hover:border-blue-600 hover:text-blue-600"
        onClick={() => setOpen((v) => !v)}
        onContextMenu={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        +
      </button>
      {open && (
        <ul className="nodrag nopan absolute top-full left-1/2 z-10 mt-1.5 min-w-36 -translate-x-1/2 rounded-lg border border-slate-300 bg-white p-1 shadow-lg">
          {registry.allowedChildren(parent.type).map((def) => (
            <li key={def.type}>
              <button
                className="w-full cursor-pointer rounded-md px-3 py-1 text-left text-sm hover:bg-blue-50"
                onClick={() => {
                  setOpen(false);
                  addChild(parent.id, slotId, def.type);
                }}
              >
                {def.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
