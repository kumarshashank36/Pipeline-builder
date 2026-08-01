// BaseNode.js
// The single node abstraction every node type is built from.
//
// It owns: the shell + header, field rendering (text / number / select /
// textarea), store persistence, and all handle layout. A node type supplies a
// config object (see nodeConfigs.js); it does not write layout or handle code.
//
// Handles come in two flavours:
//   - unlabeled -> rendered flush on the node edge, evenly spaced per side
//   - labeled   -> rendered in the ports strip with a readable name
// `extraHandles` lets a node inject handles at runtime (the Text node uses this
// for its {{variable}} handles).
// --------------------------------------------------

import { useEffect, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { NODE_CONFIGS, resolveFieldDefault } from './nodeConfigs';
import { Icon } from '../icons';

const POSITION_MAP = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

/* ------------------------------------------------------------------ */
/* Field renderer                                                      */
/* ------------------------------------------------------------------ */
const NodeField = ({ nodeId, field, value, onChange }) => {
  const inputId = `${nodeId}-field-${field.name}`;
  const common = {
    id: inputId,
    className: 'field-input nodrag',
    value: value ?? '',
    onChange: (e) => onChange(field.name, e.target.value),
  };

  let control;
  if (field.type === 'select') {
    control = (
      <select {...common}>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  } else if (field.type === 'textarea') {
    control = <textarea {...common} rows={field.rows || 2} placeholder={field.placeholder} />;
  } else if (field.type === 'number') {
    control = (
      <input
        {...common}
        type="number"
        min={field.min}
        max={field.max}
        step={field.step}
        placeholder={field.placeholder}
      />
    );
  } else {
    control = <input {...common} type="text" placeholder={field.placeholder} />;
  }

  return (
    <div>
      <label className="field-label" htmlFor={inputId}>
        {field.label}
      </label>
      {control}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* BaseNode                                                            */
/* ------------------------------------------------------------------ */
export const BaseNode = ({
  id,
  data,
  selected,
  type,
  extraHandles = [],
  widthOverride,
  children,
}) => {
  const config = NODE_CONFIGS[type];
  const updateNodeField = useStore((state) => state.updateNodeField);
  const removeNode = useStore((state) => state.removeNode);
  const fields = useMemo(() => config.fields || [], [config.fields]);

  // Seed configured defaults into the store once, so the payload sent to the
  // backend reflects what the user sees rather than a half-empty object.
  useEffect(() => {
    fields.forEach((field) => {
      if (data?.[field.name] === undefined) {
        const initial = resolveFieldDefault(field, { id, data });
        if (initial !== undefined) updateNodeField(id, field.name, initial);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allHandles = useMemo(
    () => [...(config.handles || []), ...extraHandles],
    [config.handles, extraHandles]
  );

  const labeled = allHandles.filter((h) => h.label);
  const unlabeled = allHandles.filter((h) => !h.label);

  const inputs = labeled.filter((h) => h.type === 'target');
  const outputs = labeled.filter((h) => h.type === 'source');

  // Unlabeled handles sit flush on the edge, evenly distributed per side.
  const bySide = unlabeled.reduce((acc, handle) => {
    (acc[handle.position] = acc[handle.position] || []).push(handle);
    return acc;
  }, {});

  return (
    <div
      className={`node-shell ${selected ? 'is-selected' : ''}`}
      style={{ width: widthOverride || config.width || 240, '--node-accent': config.accent }}
    >
      {/* Edge-mounted handles ---------------------------------------- */}
      {Object.entries(bySide).map(([side, handles]) =>
        handles.map((handle, index) => (
          <Handle
            key={handle.id}
            type={handle.type}
            position={POSITION_MAP[side]}
            id={`${id}-${handle.id}`}
            style={{ top: `${((index + 1) / (handles.length + 1)) * 100}%` }}
          />
        ))
      )}

      {/* Header ------------------------------------------------------ */}
      <div className="node-header">
        <span className="node-icon" style={{ background: config.gradient }}>
          <Icon name={config.icon} size={13} strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="node-title block truncate">{config.label}</span>
          <span className="node-sub block truncate">{id}</span>
        </span>
        <button
          className="icon-button node-delete nodrag nopan"
          onClick={() => removeNode(id)}
          type="button"
          aria-label={`Delete ${config.label} node`}
          data-tooltip="Delete node"
        >
          <Icon name="trash" size={13} />
        </button>
      </div>

      {/* Body -------------------------------------------------------- */}
      {(fields.length > 0 || children) && (
        <div className="node-body">
          {fields.map((field) => (
            <NodeField
              key={field.name}
              nodeId={id}
              field={field}
              value={resolveFieldDefault(field, { id, data })}
              onChange={(name, value) => updateNodeField(id, name, value)}
            />
          ))}
          {children}
        </div>
      )}

      {/* Named ports ------------------------------------------------- */}
      {labeled.length > 0 && (
        <div className="node-ports">
          <div className="ports-col">
            {inputs.map((handle) => (
              <div className="port" key={handle.id}>
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`${id}-${handle.id}`}
                  className={handle.variable ? 'handle-var' : undefined}
                />
                <span className="port-label pl-3">{handle.label}</span>
              </div>
            ))}
          </div>
          <div className="ports-col items-end">
            {outputs.map((handle) => (
              <div className="port justify-end" key={handle.id}>
                <span className="port-label pr-3">{handle.label}</span>
                <Handle type="source" position={Position.Right} id={`${id}-${handle.id}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Factory for config-only nodes. A node type that needs no custom behaviour is
 * one line: `export const FilterNode = createNode('filter');`
 */
export const createNode = (type) => {
  const NodeComponent = (props) => <BaseNode {...props} type={type} />;
  NodeComponent.displayName = `${NODE_CONFIGS[type]?.label || type}Node`;
  return NodeComponent;
};
