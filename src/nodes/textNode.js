// textNode.js
//
// The one node with behaviour beyond its config (assessment Part 3):
//   1. The textarea and the node grow as the user types.
//   2. Valid `{{ variableName }}` references become left-side target handles.
//
// Everything else — shell, header, output handle, port layout — comes from
// BaseNode, so this file only contains what is genuinely Text-specific.
// --------------------------------------------------

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useUpdateNodeInternals } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

// A double-braced reference whose body is a valid JS identifier.
// `{{ 123bad }}` and `{{ two words }}` deliberately do not match.
const VARIABLE_PATTERN = /\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g;

const MIN_WIDTH = 248;
const MAX_WIDTH = 360;
const MIN_TEXTAREA_HEIGHT = 62;
const MAX_TEXTAREA_HEIGHT = 320;
const HORIZONTAL_CHROME = 36; // textarea chrome + node body padding

// The textarea inherits the app's proportional UI font, so a per-character
// estimate expands narrow text (for example, `i` and spaces) too early.
const textMeasureContext = document.createElement('canvas').getContext('2d');
const TEXT_FONT = '12px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const getLongestLineWidth = (text) => {
  if (!textMeasureContext) return 0;
  textMeasureContext.font = TEXT_FONT;
  return Math.ceil(
    text.split('\n').reduce((widest, line) => Math.max(widest, textMeasureContext.measureText(line).width), 0)
  );
};

export const extractVariables = (text = '') => {
  const seen = [];
  let match;
  VARIABLE_PATTERN.lastIndex = 0;
  while ((match = VARIABLE_PATTERN.exec(text)) !== null) {
    if (!seen.includes(match[1])) seen.push(match[1]);
  }
  return seen;
};

export const TextNode = ({ id, data, selected }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const updateNodeInternals = useUpdateNodeInternals();
  const textareaRef = useRef(null);

  const text = data?.text ?? '{{input}}';
  const [textareaHeight, setTextareaHeight] = useState(MIN_TEXTAREA_HEIGHT);

  // Seed the default so the backend receives the visible value.
  useEffect(() => {
    if (data?.text === undefined) updateNodeField(id, 'text', '{{input}}');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const variables = useMemo(() => extractVariables(text), [text]);

  // Width tracks the rendered longest line, clamped to a sensible range.
  const width = useMemo(() => {
    return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, getLongestLineWidth(text) + HORIZONTAL_CHROME));
  }, [text]);

  // Height follows the browser's real wrap layout. A fixed character-count
  // estimate expands too soon while the node is still widening for a line.
  // useLayoutEffect avoids a visible reflow jump.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(
      MAX_TEXTAREA_HEIGHT,
      Math.max(MIN_TEXTAREA_HEIGHT, el.scrollHeight)
    );
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
    setTextareaHeight(next);
  }, [text, width]);

  // ReactFlow caches handle geometry; tell it to re-measure whenever the
  // handle set or the node's size changes, otherwise edges detach visually.
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, variables, width, textareaHeight, updateNodeInternals]);

  const extraHandles = useMemo(
    () =>
      variables.map((name) => ({
        id: `var-${name}`,
        type: 'target',
        position: 'left',
        label: name,
        variable: true,
      })),
    [variables]
  );

  const handleChange = useCallback(
    (event) => updateNodeField(id, 'text', event.target.value),
    [id, updateNodeField]
  );

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      type="text"
      extraHandles={extraHandles}
      widthOverride={width}
    >
      <div>
        <label className="field-label" htmlFor={`${id}-text`}>
          Template
        </label>
        <textarea
          id={`${id}-text`}
          ref={textareaRef}
          className="field-input nodrag nowheel"
          value={text}
          onChange={handleChange}
          spellCheck={false}
          placeholder="Write a prompt, use {{ variable }} to add inputs"
          style={{ height: textareaHeight }}
        />
      </div>

      {variables.length > 0 && (
        <div className="var-chip-list">
          {variables.map((name) => (
            <span key={name} className="var-chip">
              {name}
            </span>
          ))}
        </div>
      )}
    </BaseNode>
  );
};
