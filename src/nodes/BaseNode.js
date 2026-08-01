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

import { useCallback, useEffect, useMemo } from 'react';
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
    onChange: (event) => onChange(field.name, event.target.value),
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
const NO_EXTRA_HANDLES = Object.freeze([]);

export const BaseNode = ({
  id,
  data,
  selected,
  type,
  // A shared frozen default: a fresh `[]` literal would be a new reference on
  // every render and would invalidate the handle memo below.
  extraHandles = NO_EXTRA_HANDLES,
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

  const handleChange = useCallback(
    (name, value) => updateNodeField(id, name, value),
    [id, updateNodeField]
  );

  // Partition once per handle-set change rather than on every keystroke: the
  // Text node re-renders this component on each character typed.
  const { inputs, outputs, bySide } = useMemo(() => {
    const all = [...(config.handles || []), ...extraHandles];
    const labeled = all.filter((handle) => handle.label);

    return {
      inputs: labeled.filter((handle) => handle.type === 'target'),
      outputs: labeled.filter((handle) => handle.type === 'source'),
      // Unlabeled handles sit flush on the edge, evenly distributed per side.
      bySide: all
        .filter((handle) => !handle.label)
        .reduce((acc, handle) => {
          (acc[handle.position] = acc[handle.position] || []).push(handle);
          return acc;
        }, {}),
    };
  }, [config.handles, extraHandles]);

  const hasPorts = inputs.length > 0 || outputs.length > 0;

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
        <span className="node-heading">
          <span className="node-title">{config.label}</span>
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
              onChange={handleChange}
            />
          ))}
          {children}
        </div>
      )}

      {/* Named ports ------------------------------------------------- */}
      {hasPorts && (
        <div className="node-ports">
          <div className="ports-col">
            {inputs.map((handle) => (
              <div className="port port--in" key={handle.id}>
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`${id}-${handle.id}`}
                  className={handle.variable ? 'handle-var' : undefined}
                />
                <span className="port-label">{handle.label}</span>
              </div>
            ))}
          </div>
          <div className="ports-col ports-col--out">
            {outputs.map((handle) => (
              <div className="port port--out" key={handle.id}>
                <span className="port-label">{handle.label}</span>
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
