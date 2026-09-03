/**
 * @jest-environment jsdom
 */
import {
  guardHeadingScrollIntoView,
  isEditorChromeScroller,
  pinEditorChromeScroll,
  resetEditorChromeScroll,
  scrollPreviewHeadingIntoView,
} from './tocViewport';

function mountEditorChrome() {
  const root = document.createElement('div');
  root.className = 'bytemd';

  const body = document.createElement('div');
  body.className = 'bytemd-body';
  Object.defineProperty(body, 'scrollTop', { value: 0, writable: true, configurable: true });
  Object.defineProperty(body, 'scrollLeft', { value: 0, writable: true, configurable: true });

  const editor = document.createElement('div');
  editor.className = 'bytemd-editor';
  Object.defineProperty(editor, 'scrollTop', { value: 0, writable: true, configurable: true });

  const cm = document.createElement('div');
  cm.className = 'CodeMirror';
  Object.defineProperty(cm, 'scrollTop', { value: 0, writable: true, configurable: true });

  const cmScroll = document.createElement('div');
  cmScroll.className = 'CodeMirror-scroll';
  Object.defineProperty(cmScroll, 'scrollTop', { value: 0, writable: true, configurable: true });
  cm.appendChild(cmScroll);
  editor.appendChild(cm);

  const preview = document.createElement('div');
  preview.className = 'bytemd-preview';
  Object.defineProperty(preview, 'scrollTop', { value: 0, writable: true, configurable: true });

  const markdownBody = document.createElement('div');
  markdownBody.className = 'markdown-body';
  const h1 = document.createElement('h1');
  h1.textContent = '一级标题';
  const h2 = document.createElement('h2');
  h2.textContent = '二级标题';
  markdownBody.append(h1, h2);
  preview.appendChild(markdownBody);

  body.append(editor, preview);
  root.appendChild(body);
  document.body.appendChild(root);

  return { root, body, editor, cm, cmScroll, preview, markdownBody, h1, h2 };
}

describe('tocViewport', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('treats bytemd body/editor/CodeMirror wrapper as chrome, not CodeMirror-scroll', () => {
    const { body, editor, cm, cmScroll } = mountEditorChrome();
    expect(isEditorChromeScroller(body)).toBe(true);
    expect(isEditorChromeScroller(editor)).toBe(true);
    expect(isEditorChromeScroller(cm)).toBe(true);
    expect(isEditorChromeScroller(cmScroll)).toBe(false);
  });

  it('resetEditorChromeScroll zeros chrome scroll but leaves CodeMirror-scroll', () => {
    const { root, body, cm, cmScroll } = mountEditorChrome();
    body.scrollTop = 240;
    cm.scrollTop = 80;
    cmScroll.scrollTop = 120;

    expect(resetEditorChromeScroll(root)).toBe(2);
    expect(body.scrollTop).toBe(0);
    expect(cm.scrollTop).toBe(0);
    expect(cmScroll.scrollTop).toBe(120);
  });

  it('scrollPreviewHeadingIntoView only moves the preview pane', () => {
    const { body, preview, h2 } = mountEditorChrome();
    body.scrollTop = 0;
    preview.getBoundingClientRect = () =>
      ({ top: 0, left: 0, bottom: 400, right: 400, width: 400, height: 400, x: 0, y: 0, toJSON() {} });
    h2.getBoundingClientRect = () =>
      ({ top: 220, left: 0, bottom: 250, right: 400, width: 400, height: 30, x: 0, y: 220, toJSON() {} });

    expect(scrollPreviewHeadingIntoView(h2)).toBe(true);
    expect(preview.scrollTop).toBe(220);
    expect(body.scrollTop).toBe(0);
  });

  it('guarded heading.scrollIntoView does not leave bytemd-body scrolled (ByteMD TOC path)', () => {
    const { root, body, markdownBody, h1, h2 } = mountEditorChrome();
    const native = jest.fn(function nativeScrollIntoView() {
      body.scrollTop = 360;
    });
    h1.scrollIntoView = native;
    h2.scrollIntoView = native;

    const restore = guardHeadingScrollIntoView(markdownBody);
    h2.getBoundingClientRect = () =>
      ({ top: 40, left: 0, bottom: 70, right: 100, width: 100, height: 30, x: 0, y: 40, toJSON() {} });
    root.querySelector('.bytemd-preview')!.getBoundingClientRect = () =>
      ({ top: 0, left: 0, bottom: 400, right: 400, width: 400, height: 400, x: 0, y: 0, toJSON() {} });

    h2.scrollIntoView();

    expect(native).not.toHaveBeenCalled();
    expect(body.scrollTop).toBe(0);
    restore();
  });

  it('pinEditorChromeScroll snaps bytemd-body back when scrollIntoView moves it', () => {
    const { root, body, cmScroll } = mountEditorChrome();
    const unpin = pinEditorChromeScroll(root);

    body.scrollTop = 400;
    body.dispatchEvent(new Event('scroll'));
    expect(body.scrollTop).toBe(0);

    cmScroll.scrollTop = 90;
    cmScroll.dispatchEvent(new Event('scroll'));
    expect(cmScroll.scrollTop).toBe(90);

    unpin();
    body.scrollTop = 50;
    body.dispatchEvent(new Event('scroll'));
    expect(body.scrollTop).toBe(50);
  });
});
