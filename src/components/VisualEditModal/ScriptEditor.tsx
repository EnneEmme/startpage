import { h } from 'preact';
import styles from '../VisualEditModal.module.css';

interface ScriptEditorProps {
  scriptSnippet: string;
  setScriptSnippet: (val: string) => void;
}

export const ScriptEditor = ({ scriptSnippet, setScriptSnippet }: ScriptEditorProps) => (
  <div class={styles.fieldGroup}>
    <label class={styles.label}>Codice JavaScript / Bookmarklet</label>
    <textarea
      class={styles.input}
      style={{ minHeight: '105px', fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}
      placeholder="es. (function() { const targetUrl = 'https://...'; window.location.href = targetUrl; })();"
      value={scriptSnippet}
      onInput={e => setScriptSnippet((e.target as HTMLInputElement).value)}
      required
    />
    <span class={styles.helperText}>
      💡 <strong>Come reindirizzare all'URL finale:</strong> Inserisci nel tuo codice JavaScript l'istruzione:
      <br />
      <code>window.location.href = "https://tuo-url-calcolato.com";</code> (oppure <code>window.open("...", "_blank")</code>).
      <br />
      Puoi inserire sia codice JS diretto che bookmarklet (es. <code>javascript:(function(){"{"}/* codice */{"}"})();</code>).
    </span>
  </div>
);
