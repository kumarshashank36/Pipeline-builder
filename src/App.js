// App.js
// Application shell: topbar (brand + canvas actions), node palette, canvas,
// and the submit action. All state lives in the store or the theme hook.
// --------------------------------------------------

import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { useStore } from './store';
import { useTheme } from './useTheme';
import { Icon } from './icons';

function App() {
  const hasNodes = useStore((state) => state.nodes.length > 0);
  const clearPipeline = useStore((state) => state.clearPipeline);
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';
  const themeLabel = `Switch to ${isDark ? 'light' : 'dark'} mode`;

  return (
    <div className="pipeline-app">
      <header className="app-topbar">
        <div className="brand-lockup" aria-label="VectorShift Pipeline Builder">
          <span>
            <strong>VectorShift</strong>
            <small>Pipeline Builder</small>
          </span>
        </div>
        <div className="topbar-actions">
          <button
            className="icon-button topbar-icon-button"
            onClick={clearPipeline}
            type="button"
            disabled={!hasNodes}
            aria-label="Clear canvas"
            data-tooltip="Clear canvas"
            title="Clear canvas"
          >
            <Icon name="trash" size={15} />
          </button>
          <button
            className={`theme-icon-toggle theme-icon-toggle--${theme}`}
            onClick={toggleTheme}
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={themeLabel}
            data-tooltip={themeLabel}
            title={themeLabel}
          >
            <span className="theme-icon-toggle__thumb" aria-hidden="true">
              <Icon name={isDark ? 'moon' : 'sun'} size={13} />
            </span>
            <Icon name="sun" size={12} className="theme-icon-toggle__sun" />
            <Icon name="moon" size={12} className="theme-icon-toggle__moon" />
          </button>
        </div>
      </header>

      <PipelineToolbar />
      <PipelineUI />

      <div className="pipeline-actions">
        <SubmitButton />
      </div>

      <span className="project-watermark" aria-label="Project by Kumar Shashank">
        Developed by Kumar Shashank
      </span>
    </div>
  );
}

export default App;
