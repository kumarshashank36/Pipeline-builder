import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import { useStore } from './store';
import { Icon } from './icons';

export const DeletableEdge = ({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  style,
  selected,
}) => {
  const removeEdge = useStore((state) => state.removeEdge);
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        className={`pipeline-edge ${selected ? 'is-selected' : ''}`}
      />
      <EdgeLabelRenderer>
        <div
          className="edge-delete-control nodrag nopan"
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          <button
            className="icon-button edge-delete-button"
            onClick={() => removeEdge(id)}
            type="button"
            aria-label="Delete connection"
            data-tooltip="Delete connection"
          >
            <Icon name="trash" size={12} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
