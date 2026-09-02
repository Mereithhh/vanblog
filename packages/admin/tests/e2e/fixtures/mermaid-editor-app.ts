import { Editor } from 'bytemd';
import { mermaidForEditor } from '../../../src/components/Editor/plugins/mermaidSafety';
import mermaidArticle from './mermaid-article.md';

let value = String(mermaidArticle);
const target = document.getElementById('app');

if (!target) {
  throw new Error('Missing #app');
}

const editor = new Editor({
  target,
  props: {
    value,
    plugins: [mermaidForEditor()],
    onChange(next: string) {
      value = next;
      (window as unknown as { __editorValue: string }).__editorValue = next;
    },
  },
});

const win = window as unknown as {
  __editorValue: string;
  __editor: typeof editor;
};

win.__editorValue = value;
win.__editor = editor;

const syncFromCodeMirror = () => {
  const cm = document.querySelector('.CodeMirror') as { CodeMirror?: { getValue: () => string; on: Function } } | null;
  if (!cm?.CodeMirror) {
    window.setTimeout(syncFromCodeMirror, 50);
    return;
  }
  const update = () => {
    win.__editorValue = cm.CodeMirror.getValue();
  };
  cm.CodeMirror.on('change', update);
  update();
};

syncFromCodeMirror();
