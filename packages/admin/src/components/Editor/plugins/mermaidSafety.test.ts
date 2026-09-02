/**
 * @jest-environment jsdom
 */
import { cleanupMermaidArtifacts, isMermaidArtifact } from './mermaidSafety';

describe('mermaidSafety', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('treats mermaid measurement nodes as artifacts', () => {
    const leftover = document.createElement('div');
    leftover.id = 'dbytemd-mermaid-1700000000000-0';
    expect(isMermaidArtifact(leftover)).toBe(true);
  });

  it('removes leftover mermaid nodes without dropping the preview diagram', () => {
    const editor = document.createElement('div');
    editor.className = 'bytemd-editor';
    editor.appendChild(document.createElement('textarea'));

    const leftover = document.createElement('div');
    leftover.id = 'dbytemd-mermaid-123-0';
    leftover.style.cssText = 'position:absolute;inset:0;z-index:9999';

    const preview = document.createElement('div');
    preview.className = 'bytemd-preview';
    const diagram = document.createElement('div');
    diagram.className = 'bytemd-mermaid';
    diagram.innerHTML = '<svg></svg>';
    preview.appendChild(diagram);

    document.body.append(editor, leftover, preview);

    const removed = cleanupMermaidArtifacts();

    expect(removed).toBe(1);
    expect(document.getElementById('dbytemd-mermaid-123-0')).toBeNull();
    expect(document.querySelector('.bytemd-mermaid svg')).not.toBeNull();
  });
});
