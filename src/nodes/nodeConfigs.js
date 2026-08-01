// nodeConfigs.js
// Declarative definitions for every node type.
//
// Adding a new node = adding one object here + one line in `ui.js` + its type
// in NODE_TYPE_ORDER below. No new component, no layout code, no handle math.
// `BaseNode` reads these configs and renders the shell, fields, and handles.
//
// Field `default` may be a literal or a function receiving ({ id }).
// --------------------------------------------------

export const NODE_CONFIGS = {
  /* ---------------------------------------------------------------- */
  /* Original four                                                     */
  /* ---------------------------------------------------------------- */
  customInput: {
    label: 'Input',
    icon: 'input',
    accent: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    description: 'Pipeline entry point',
    width: 236,
    handles: [{ id: 'value', type: 'source', position: 'right' }],
    fields: [
      {
        name: 'inputName',
        label: 'Name',
        type: 'text',
        placeholder: 'input_1',
        default: ({ id }) => id.replace('customInput-', 'input_'),
      },
      {
        name: 'inputType',
        label: 'Type',
        type: 'select',
        options: ['Text', 'File'],
        default: 'Text',
      },
    ],
  },

  customOutput: {
    label: 'Output',
    icon: 'output',
    accent: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e, #be123c)',
    description: 'Pipeline exit point',
    width: 236,
    handles: [{ id: 'value', type: 'target', position: 'left' }],
    fields: [
      {
        name: 'outputName',
        label: 'Name',
        type: 'text',
        placeholder: 'output_1',
        default: ({ id }) => id.replace('customOutput-', 'output_'),
      },
      {
        name: 'outputType',
        label: 'Type',
        type: 'select',
        options: ['Text', 'Image'],
        default: 'Text',
      },
    ],
  },

  llm: {
    label: 'LLM',
    icon: 'llm',
    accent: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    description: 'Large language model',
    width: 250,
    handles: [
      { id: 'system', type: 'target', position: 'left', label: 'system' },
      { id: 'prompt', type: 'target', position: 'left', label: 'prompt' },
      { id: 'response', type: 'source', position: 'right', label: 'response' },
    ],
    fields: [
      {
        name: 'model',
        label: 'Model',
        type: 'select',
        options: ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5'],
        default: 'claude-sonnet-5',
      },
      {
        name: 'temperature',
        label: 'Temperature',
        type: 'number',
        min: 0,
        max: 2,
        step: 0.1,
        default: 0.7,
      },
    ],
  },

  text: {
    label: 'Text',
    icon: 'text',
    accent: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
    description: 'Template with {{variables}}',
    width: 260,
    handles: [{ id: 'output', type: 'source', position: 'right' }],
    // Fields are rendered by the TextNode itself (auto-resizing textarea).
    fields: [],
  },

  /* ---------------------------------------------------------------- */
  /* Five new nodes — each is config only, zero component code          */
  /* ---------------------------------------------------------------- */
  filter: {
    label: 'Filter',
    icon: 'filter',
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
    description: 'Keep matching records',
    width: 244,
    handles: [
      { id: 'data', type: 'target', position: 'left', label: 'data' },
      { id: 'passed', type: 'source', position: 'right', label: 'passed' },
      { id: 'rejected', type: 'source', position: 'right', label: 'rejected' },
    ],
    fields: [
      {
        name: 'operator',
        label: 'Operator',
        type: 'select',
        options: ['equals', 'contains', 'starts with', 'greater than', 'matches regex'],
        default: 'contains',
      },
      {
        name: 'condition',
        label: 'Value',
        type: 'text',
        placeholder: 'e.g. status = active',
        default: '',
      },
    ],
  },

  transform: {
    label: 'Transform',
    icon: 'transform',
    accent: '#d946ef',
    gradient: 'linear-gradient(135deg, #d946ef, #a21caf)',
    description: 'Reshape the payload',
    width: 244,
    handles: [
      { id: 'data', type: 'target', position: 'left', label: 'data' },
      { id: 'result', type: 'source', position: 'right', label: 'result' },
    ],
    fields: [
      {
        name: 'operation',
        label: 'Operation',
        type: 'select',
        options: ['map', 'reduce', 'flatten', 'sort', 'deduplicate'],
        default: 'map',
      },
      {
        name: 'expression',
        label: 'Expression',
        type: 'textarea',
        rows: 2,
        placeholder: 'item => item.value',
        default: '',
      },
    ],
  },

  apiRequest: {
    label: 'API Request',
    icon: 'api',
    accent: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0e7490)',
    description: 'Call an external service',
    width: 262,
    handles: [
      { id: 'body', type: 'target', position: 'left', label: 'body' },
      { id: 'headers', type: 'target', position: 'left', label: 'headers' },
      { id: 'response', type: 'source', position: 'right', label: 'response' },
      { id: 'error', type: 'source', position: 'right', label: 'error' },
    ],
    fields: [
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        default: 'POST',
      },
      {
        name: 'url',
        label: 'Endpoint',
        type: 'text',
        placeholder: 'https://api.example.com/v1',
        default: '',
      },
    ],
  },

  classifier: {
    label: 'Classifier',
    icon: 'classifier',
    accent: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    description: 'Assign a label to text',
    width: 250,
    handles: [
      { id: 'text', type: 'target', position: 'left', label: 'text' },
      { id: 'label', type: 'source', position: 'right', label: 'label' },
      { id: 'confidence', type: 'source', position: 'right', label: 'score' },
    ],
    fields: [
      {
        name: 'labels',
        label: 'Labels',
        type: 'textarea',
        rows: 2,
        placeholder: 'positive, neutral, negative',
        default: 'positive, neutral, negative',
      },
      {
        name: 'threshold',
        label: 'Min confidence',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.5,
      },
    ],
  },

  formatter: {
    label: 'Formatter',
    icon: 'formatter',
    accent: '#fb923c',
    gradient: 'linear-gradient(135deg, #fb923c, #c2410c)',
    description: 'Serialize to a format',
    width: 244,
    handles: [
      { id: 'content', type: 'target', position: 'left', label: 'content' },
      { id: 'formatted', type: 'source', position: 'right', label: 'formatted' },
    ],
    fields: [
      {
        name: 'format',
        label: 'Format',
        type: 'select',
        options: ['JSON', 'YAML', 'CSV', 'Markdown', 'Plain text'],
        default: 'JSON',
      },
      {
        name: 'pretty',
        label: 'Pretty print',
        type: 'select',
        options: ['Yes', 'No'],
        default: 'Yes',
      },
    ],
  },
};

// Toolbar order. Grouped by intent — source/sink, intelligence, data,
// integration — so related tiles sit next to each other in the palette.
export const NODE_TYPE_ORDER = [
  'customInput',
  'customOutput',
  'text',
  'llm',
  'classifier',
  'filter',
  'transform',
  'formatter',
  'apiRequest',
];

// Resolve a field's initial value: stored data wins, then the config default.
export const resolveFieldDefault = (field, { id, data }) => {
  if (data && data[field.name] !== undefined) return data[field.name];
  return typeof field.default === 'function' ? field.default({ id, data }) : field.default;
};
