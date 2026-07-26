import { render } from 'preact';
import { App } from './app';
import './styles/global.css';

const rootEl = document.getElementById('app');
if (rootEl) {
  render(<App />, rootEl);
}
