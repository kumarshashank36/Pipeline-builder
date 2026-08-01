// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap, BackgroundVariant } from 'reactflow';
import { shallow } from 'zustand/shallow';
import { useStore } from './store';

import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { FilterNode } from './nodes/filterNode';
import { TransformNode } from './nodes/transformNode';
import { ApiRequestNode } from './nodes/apiRequestNode';
import { ClassifierNode } from './nodes/classifierNode';
import { FormatterNode } from './nodes/formatterNode';

import { NODE_CONFIGS } from './nodes/nodeConfigs';
import { DeletableEdge } from './DeletableEdge';

import 'reactflow/dist/style.css';

const GRID_SIZE = 20;
const PRO_OPTIONS = { hideAttribution: true };
const DRAG_MIME = 'application/reactflow';
const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const DELETE_KEYS = ['Backspace', 'Delete'];
const FALLBACK_ACCENT = '#6c6cf5';

const getInitNodeData = (nodeID, type) => ({ id: nodeID, nodeType: type });

const getNodeAccent = (node) => NODE_CONFIGS[node.type]?.accent || FALLBACK_ACCENT;

const getDroppedNodeType = (payload) => {
  try {
    return JSON.parse(payload)?.nodeType;
  } catch {
    return null;
  }
};

const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  filter: FilterNode,
  transform: TransformNode,
  apiRequest: ApiRequestNode,
  classifier: ClassifierNode,
  formatter: FormatterNode,
};

const edgeTypes = { deletable: DeletableEdge };

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const EmptyState = () => (
  <div className="empty-canvas-message">
    Drag a node from the toolbar onto the canvas.
  </div>
);

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { nodes, edges, getNodeID, addNode, onNodesChange, onEdgesChange, onConnect } = useStore(
    selector,
    shallow
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const payload = event.dataTransfer?.getData(DRAG_MIME);
      if (!payload) return;

      const type = getDroppedNodeType(payload);
      if (!type || !NODE_CONFIGS[type]) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const nodeID = getNodeID(type);
      addNode({ id: nodeID, type, position, data: getInitNodeData(nodeID, type) });
    },
    [reactFlowInstance, addNode, getNodeID]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div ref={reactFlowWrapper} className="pipeline-canvas">
      {nodes.length === 0 && <EmptyState />}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={PRO_OPTIONS}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        connectionLineType="smoothstep"
        defaultViewport={DEFAULT_VIEWPORT}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode={DELETE_KEYS}
      >
        <Background variant={BackgroundVariant.Dots} color="var(--canvas-grid)" gap={GRID_SIZE} size={1} />
        <Controls showInteractive position="bottom-left" />
        <MiniMap
          pannable
          zoomable
          position="bottom-right"
          maskColor="var(--minimap-mask)"
          className="pipeline-minimap"
          nodeColor={getNodeAccent}
          nodeStrokeColor={getNodeAccent}
          nodeStrokeWidth={2}
          nodeBorderRadius={4}
        />
      </ReactFlow>
    </div>
  );
};
