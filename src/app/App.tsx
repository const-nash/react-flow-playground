import { useEffect } from 'react';
import { FlowCanvas } from '../canvas/FlowCanvas';
import { Sidebar } from '../sidebar/Sidebar';
import { useFlowStore } from '../store/flowStore';

export default function App() {
  const status = useFlowStore((s) => s.status);
  const init = useFlowStore((s) => s.init);

  useEffect(() => void init(), [init]);

  if (status === 'loading') {
    return <div className="grid h-screen place-items-center text-sm text-slate-400">Loading flows…</div>;
  }

  return (
    <>
      <FlowCanvas />
      <Sidebar />
    </>
  );
}
