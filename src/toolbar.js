// toolbar.js
//
// Node palette. Categories and their members come from NODE_CATEGORIES, so a
// new node type appears here automatically once it is added to nodeConfigs.
//
// Responsive: vertical rail on desktop, horizontal scroll strip on small
// screens (handled by the parent layout in App.js).
// --------------------------------------------------

import { NODE_CATEGORIES } from './nodes/nodeConfigs';
import { DraggableNode } from './draggableNode';

export const PipelineToolbar = () => (
  <div className="pipeline-toolbar" aria-label="Node toolbar">
    {NODE_CATEGORIES.flatMap((category) => category.types).map((type) => (
      <DraggableNode key={type} type={type} />
    ))}
  </div>
);
