// draggableNode.js
//
// Palette tile. The compact top strip matches the original editor layout.
// --------------------------------------------------

import { useCallback } from 'react';
import { NODE_CONFIGS } from './nodes/nodeConfigs';
import { Icon } from './icons';

export const DraggableNode = ({ type }) => {
  const config = NODE_CONFIGS[type];

  const onDragStart = useCallback(
    (event) => {
      event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType: type }));
      event.dataTransfer.effectAllowed = 'move';
      event.currentTarget.style.cursor = 'grabbing';
    },
    [type]
  );

  const resetCursor = useCallback((event) => {
    event.currentTarget.style.cursor = 'grab';
  }, []);

  if (!config) return null;

  return (
    <div
      className="draggable-node"
      draggable
      onDragStart={onDragStart}
      onDragEnd={resetCursor}
      title={config.description}
      role="button"
      tabIndex={0}
      aria-label={`Drag ${config.label} node onto the canvas`}
    >
      <Icon name={config.icon} size={18} strokeWidth={2} />
      <span>{config.label}</span>
    </div>
  );
};
