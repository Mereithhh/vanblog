const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  isEditableKeyboardTarget,
  isArrowKey,
  shouldInterceptEditorHotkey,
  handleEditorHotkey,
  stopMenuKeydown,
} = require('../../src/services/van-blog/editableKeyboard');

function createKeyEvent(key, extras = {}) {
  let defaultPrevented = false;
  let propagationStopped = false;
  return {
    key,
    metaKey: false,
    ctrlKey: false,
    target: extras.target ?? null,
    preventDefault() {
      defaultPrevented = true;
    },
    stopPropagation() {
      propagationStopped = true;
    },
    get defaultPrevented() {
      return defaultPrevented;
    },
    get cancelBubble() {
      return propagationStopped;
    },
    ...extras,
  };
}

const titleInput = { tagName: 'INPUT', type: 'text', id: 'title' };
const titleTextarea = { tagName: 'TEXTAREA', id: 'title' };
const contentEditable = { tagName: 'DIV', isContentEditable: true };
const buttonInput = { tagName: 'INPUT', type: 'button' };
const submitButton = { tagName: 'BUTTON' };

describe('editableKeyboard (#390)', () => {
  it('treats title input / textarea / contenteditable as editable targets', () => {
    assert.equal(isEditableKeyboardTarget(titleInput), true);
    assert.equal(isEditableKeyboardTarget(titleTextarea), true);
    assert.equal(isEditableKeyboardTarget(contentEditable), true);
    assert.equal(isEditableKeyboardTarget(buttonInput), false);
    assert.equal(isEditableKeyboardTarget(submitButton), false);
    assert.equal(isEditableKeyboardTarget(null), false);
  });

  it('recognizes ArrowLeft / ArrowRight (and legacy Left / Right)', () => {
    assert.equal(isArrowKey('ArrowLeft'), true);
    assert.equal(isArrowKey('ArrowRight'), true);
    assert.equal(isArrowKey('ArrowUp'), true);
    assert.equal(isArrowKey('ArrowDown'), true);
    assert.equal(isArrowKey('Left'), true);
    assert.equal(isArrowKey('Right'), true);
    assert.equal(isArrowKey('s'), false);
  });

  it('does not intercept ArrowLeft / ArrowRight when the title input is focused', () => {
    for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
      const ev = createKeyEvent(key, { target: titleInput });
      assert.equal(shouldInterceptEditorHotkey(ev), false);
      const saved = [];
      const handled = handleEditorHotkey(ev, () => saved.push(key));
      assert.equal(handled, false);
      assert.equal(ev.defaultPrevented, false);
      assert.deepEqual(saved, []);
    }
  });

  it('does not preventDefault ArrowLeft / ArrowRight on textarea or contenteditable', () => {
    for (const target of [titleTextarea, contentEditable]) {
      const left = createKeyEvent('ArrowLeft', { target });
      handleEditorHotkey(left, () => {
        throw new Error('save must not run');
      });
      assert.equal(left.defaultPrevented, false);

      const right = createKeyEvent('ArrowRight', { target });
      handleEditorHotkey(right, () => {
        throw new Error('save must not run');
      });
      assert.equal(right.defaultPrevented, false);
    }
  });

  it('still intercepts Ctrl/Cmd+S even when the title input is focused', () => {
    const ctrlS = createKeyEvent('s', { ctrlKey: true, target: titleInput });
    let saved = 0;
    assert.equal(shouldInterceptEditorHotkey(ctrlS), true);
    assert.equal(handleEditorHotkey(ctrlS, () => saved++), true);
    assert.equal(ctrlS.defaultPrevented, true);
    assert.equal(saved, 1);

    const metaS = createKeyEvent('s', { metaKey: true, target: titleInput });
    assert.equal(handleEditorHotkey(metaS, () => saved++), true);
    assert.equal(metaS.defaultPrevented, true);
    assert.equal(saved, 2);
  });

  it('never intercepts plain characters in an editable title field', () => {
    const ev = createKeyEvent('a', { target: titleInput });
    assert.equal(shouldInterceptEditorHotkey(ev), false);
    handleEditorHotkey(ev, () => {
      throw new Error('save must not run');
    });
    assert.equal(ev.defaultPrevented, false);
  });

  it('stopMenuKeydown only stops bubbling so menus cannot steal arrows', () => {
    const ev = createKeyEvent('ArrowLeft', { target: titleInput });
    stopMenuKeydown(ev);
    assert.equal(ev.cancelBubble, true);
    assert.equal(ev.defaultPrevented, false);
  });
});
