// toolbar.js
//
// Node palette. Tiles are driven by NODE_TYPE_ORDER, so a new node type appears
// here automatically once it is added to nodeConfigs.
//
// Responsive: wraps on wide viewports, becomes a horizontal scroll strip on
// small ones (see the `.pipeline-toolbar` rules in index.css).
// --------------------------------------------------

import { NODE_TYPE_ORDER } from './nodes/nodeConfigs';
import { DraggableNode } from './draggableNode';

export const PipelineToolbar = () => (
  <div className="pipeline-toolbar" aria-label="Node toolbar">
    {NODE_TYPE_ORDER.map((type) => (
      <DraggableNode key={type} type={type} />
    ))}
  </div>
);
