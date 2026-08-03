import styles from './VisualEditModal.module.css';

interface ScriptEditorProps {
  scriptSnippet: string;
  setScriptSnippet: (val: string) => void;
}

export const ScriptEditor = ({ scriptSnippet, setScriptSnippet }: ScriptEditorProps) => (
  <div class={styles.fieldGroup}>
    <label class={styles.label} for="vem-script">JavaScript Code / Bookmarklet</label>
    <textarea
      id="vem-script"
      class={`${styles.input} ${styles.scriptInput}`}
      placeholder="e.g. (function() { const targetUrl = 'https://...'; window.location.href = targetUrl; })();"
      value={scriptSnippet}
      onInput={e => setScriptSnippet((e.target as HTMLInputElement).value)}
      required
    />
    <span class={styles.helperText}>
      💡 <strong>How to redirect to the final URL:</strong> include this statement in your JavaScript code:
      <br />
      <code>window.location.href = "https://your-computed-url.com";</code> (or <code>window.open("...", "_blank")</code>).
      <br />
      You can enter plain JS code or a bookmarklet (e.g. <code>javascript:(function(){"{"}/* code */{"}"})();</code>).
    </span>
  </div>
);
