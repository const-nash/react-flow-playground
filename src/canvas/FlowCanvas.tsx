import { useMemo } from 'react';
import { Background, Controls, ReactFlow, type NodeTypes } from '@xyflow/react';
import { buildLayout } from '../core';
import { registry } from '../node-types';
import { selectCurrentFlow, useFlowStore } from '../store/flowStore';
import { ConfirmDialog } from './ConfirmDialog';
import { ContentNode } from './ContentNode';
import { PlusNode } from './PlusNode';
import { toFlowEdge, toFlowNode } from './toReactFlow';

const nodeTypes: NodeTypes = { content: ContentNode, plus: PlusNode };

export function FlowCanvas() {
  const tree = useFlowStore((s) => selectCurrentFlow(s).nodes);
  const currentId = useFlowStore((s) => s.currentId);

  const { nodes, edges } = useMemo(() => {
    const layout = buildLayout(registry, tree);
    return { nodes: layout.nodes.map(toFlowNode), edges: layout.edges.map(toFlowEdge) };
  }, [tree]);

  return (
    <div className="h-screen w-screen">
      <ReactFlow
        // Remount per flow so each one opens fitted to the viewport.
        key={currentId}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        // No onNodesChange / onEdgesChange: React Flow cannot mutate nodes on its own.
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        edgesReconnectable={false}
        elementsSelectable={false}
        selectNodesOnDrag={false}
        selectionOnDrag={false}
        deleteKeyCode={null}
        selectionKeyCode={null}
        multiSelectionKeyCode={null}
        disableKeyboardA11y
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        minZoom={0.2}
        maxZoom={2}
        fitView
        fitViewOptions={{ maxZoom: 1, padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
      <ConfirmDialog />
    </div>
  );
}
