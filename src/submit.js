// submit.js
// Sends the live ReactFlow graph to the assessment endpoint and presents its
// validation result without changing the editor workflow.

import { useCallback, useEffect, useState } from 'react';
import { useStore } from './store';
import { Icon } from './icons';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const Stat = ({ icon, label, value }) => (
  <div className="result-stat">
    <span className="result-stat__icon"><Icon name={icon} size={14} /></span>
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
);

const ValidationFlow = () => (
  <div className="validation-flow" aria-live="polite">
    <span className="validation-orbit" aria-hidden="true"><i /></span>
    <div>
      <h2>Validating pipeline</h2>
      <p>Checking your graph against the pipeline rules.</p>
    </div>
    <div className="validation-steps">
      <span><Icon name="check" size={12} /> Inspecting nodes</span>
      <span><Icon name="check" size={12} /> Verifying connections</span>
      <span><Icon name="nodes" size={12} /> Detecting cycles</span>
    </div>
  </div>
);

const ResultModal = ({ status, result, error, onClose }) => {
  const isValidating = status === 'validating';
  const isDag = result?.is_dag;
  const isError = status === 'error';

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && !isValidating) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isValidating, onClose]);

  return (
    <div
      className="result-overlay"
      onClick={isValidating ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pipeline validation result"
    >
      <div className="result-dialog" onClick={(event) => event.stopPropagation()}>
        {isValidating ? (
          <ValidationFlow />
        ) : (
          <>
            <div className="result-heading">
              <span className={`result-status-icon ${isError || !isDag ? 'is-invalid' : 'is-valid'}`}>
                <Icon name={isError || !isDag ? 'alert' : 'check'} size={19} />
              </span>
              <div>
                <h2>{isError ? 'Validation unavailable' : isDag ? 'Graph is a valid DAG' : 'Graph needs attention'}</h2>
                <p>
                  {isError
                    ? 'The validation service could not complete this request.'
                    : isDag
                      ? 'No circular dependencies were found.'
                      : 'A circular dependency was found in this pipeline.'}
                </p>
              </div>
            </div>

            {isError ? (
              <p className="result-error">{error}</p>
            ) : (
              <>
                <div className="result-stats">
                  <Stat icon="nodes" label="Nodes analyzed" value={result.num_nodes} />
                  <Stat icon="edges" label="Connections" value={result.num_edges} />
                </div>
                <div className={`dag-result ${isDag ? '' : 'is-invalid'}`}>
                  <Icon name={isDag ? 'check' : 'alert'} size={15} />
                  <span>
                    <strong>{isDag ? 'DAG valid' : 'DAG invalid'}</strong>
                    {isDag
                      ? ' The graph can run without cyclic dependencies.'
                      : ' Remove the circular connection, then validate again.'}
                  </span>
                </div>
              </>
            )}
          </>
        )}

        {!isValidating && (
          <div className="dialog-actions">
            <button className="submit-button" onClick={onClose} type="button">Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

export const SubmitButton = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async () => {
    setStatus('validating');
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status} ${response.statusText}`);
      }

      setResult(await response.json());
      setStatus('success');
    } catch (requestError) {
      setError(
        `${requestError.message}. Make sure the backend is running at ${API_BASE}.`
      );
      setStatus('error');
    }
  }, [nodes, edges]);

  const close = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return (
    <>
      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={status === 'validating' || nodes.length === 0}
        type="button"
        title={nodes.length === 0 ? 'Add a node to submit a pipeline' : 'Validate pipeline'}
      >
        <Icon name="send" size={14} />
        <span>{status === 'validating' ? 'Validating…' : 'Submit'}</span>
      </button>
      {status !== 'idle' && <ResultModal status={status} result={result} error={error} onClose={close} />}
    </>
  );
};
