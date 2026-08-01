// App.js
//
import { useEffect, useState } from 'react';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { useStore } from './store';
import { Icon } from './icons';

const THEME_STORAGE_KEY = 'vectorshift-theme';

const getSavedTheme = () => {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
};

function App() {
  const hasNodes = useStore((state) => state.nodes.length > 0);
  const clearPipeline = useStore((state) => state.clearPipeline);
  const [theme, setTheme] = useState(getSavedTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="pipeline-app" data-theme={theme}>
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
            onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
            type="button"
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            data-tooltip={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="theme-icon-toggle__thumb" aria-hidden="true">
              <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={13} />
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
