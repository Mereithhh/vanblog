/**
 * Keyboard helpers for admin forms / editor shortcuts.
 * Arrow keys must reach title and other text fields so the caret can move (#390).
 */

const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'submit',
  'checkbox',
  'radio',
  'file',
  'reset',
  'image',
  'range',
  'color',
  'hidden',
]);

function nodeOf(target) {
  if (!target) {
    return null;
  }
  if (target.nodeType === 3) {
    return target.parentElement || null;
  }
  return target;
}

function isEditableKeyboardTarget(target) {
  const node = nodeOf(target);
  if (!node || !node.tagName) {
    return false;
  }
  const tag = String(node.tagName).toUpperCase();
  if (tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }
  if (tag === 'INPUT') {
    const type = String(node.type || 'text').toLowerCase();
    return !NON_TEXT_INPUT_TYPES.has(type);
  }
  if (node.isContentEditable) {
    return true;
  }
  if (typeof node.closest === 'function') {
    return Boolean(
      node.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]'),
    );
  }
  return false;
}

function isArrowKey(key) {
  const normalized = key == null ? '' : String(key).toLocaleLowerCase();
  return (
    normalized === 'arrowleft' ||
    normalized === 'arrowright' ||
    normalized === 'arrowup' ||
    normalized === 'arrowdown' ||
    normalized === 'left' ||
    normalized === 'right' ||
    normalized === 'up' ||
    normalized === 'down'
  );
}

function isSaveHotkey(ev) {
  const key = ev?.key == null ? '' : String(ev.key).toLocaleLowerCase();
  return key === 's' && !!(ev?.metaKey || ev?.ctrlKey);
}

/**
 * True only for Ctrl/Cmd+S. Arrow keys and typing in inputs are never intercepted.
 */
function shouldInterceptEditorHotkey(ev) {
  if (!ev) {
    return false;
  }
  if (isArrowKey(ev.key)) {
    return false;
  }
  if (isSaveHotkey(ev)) {
    return true;
  }
  if (isEditableKeyboardTarget(ev.target)) {
    return false;
  }
  return false;
}

/**
 * Window/document keydown handler for editor pages.
 * Returns true when the event was handled (Ctrl/Cmd+S).
 */
function handleEditorHotkey(ev, onSave) {
  if (!shouldInterceptEditorHotkey(ev)) {
    return false;
  }
  ev.preventDefault();
  if (typeof onSave === 'function') {
    onSave();
  }
  return true;
}

/** Dropdown/Menu treats arrows as navigation; stop that from reaching the menu. */
function stopMenuKeydown(ev) {
  if (ev && typeof ev.stopPropagation === 'function') {
    ev.stopPropagation();
  }
}

module.exports = {
  isEditableKeyboardTarget,
  isArrowKey,
  isSaveHotkey,
  shouldInterceptEditorHotkey,
  handleEditorHotkey,
  stopMenuKeydown,
};
