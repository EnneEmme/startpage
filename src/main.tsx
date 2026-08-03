import { render } from 'preact';
import { App } from './app';
import { setScriptConfirmHandler } from './engine';
import { confirmDialog } from './stores';
import './styles/global.css';

// Security gate: custom JS bookmarklets/scripts run only after an explicit,
// per-script-hash user confirmation (see engine/scriptConsent.ts). Pure-engine
// contexts (unit tests) register no handler and execute directly by design.
setScriptConfirmHandler(link =>
  confirmDialog({
    title: 'Run custom script?',
    message: `"${link.title}" wants to run custom JavaScript. Run it?`,
    confirmLabel: 'Run script',
    cancelLabel: 'Cancel',
    danger: true
  })
);

const rootEl = document.getElementById('app');
if (rootEl) {
  render(<App />, rootEl);
}
