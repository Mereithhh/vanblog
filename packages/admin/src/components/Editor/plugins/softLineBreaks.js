'use strict';

/**
 * Optional admin-editor helper for CommonMark soft line breaks (#311).
 *
 * Standard Markdown needs two trailing spaces (or a backslash) before a
 * newline to render `<br>`. When the preference is on, Enter and multi-line
 * paste complete those spaces while writing. Off (default) leaves source
 * unchanged so existing published articles stay as-is.
 */

const FENCE_RE = /^\s{0,3}(`{3,}|~{3,})/;
const ATX_HEADING_RE = /^\s{0,3}#{1,6}(?:\s|$)/;
const THEMATIC_RE = /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/;
const CONTAINER_RE = /^\s{0,3}:{3,}/;
const HTML_COMMENT_RE = /^\s*<!--/;
const SETEXT_RE = /^\s{0,3}(?:=+|-+)\s*$/;
const INDENTED_CODE_RE = /^(?: {4}|\t)/;

function isSoftLineBreaksEnabled(value) {
  return value === true || value === 'open';
}

function isFenceToggle(line) {
  return FENCE_RE.test(String(line || ''));
}

function isInsideCodeFenceFromDoc(getLine, lineCount, lineIndex) {
  let fence = false;
  const last = Math.min(Math.max(0, lineIndex), Number(lineCount) || 0);
  for (let i = 0; i < last; i += 1) {
    if (isFenceToggle(typeof getLine === 'function' ? getLine(i) : '')) {
      fence = !fence;
    }
  }
  return fence;
}

function isStructuralBreak(line) {
  const text = String(line || '');
  if (!text || /^\s*$/.test(text)) {
    return true;
  }
  return (
    isFenceToggle(text) ||
    ATX_HEADING_RE.test(text) ||
    THEMATIC_RE.test(text) ||
    CONTAINER_RE.test(text) ||
    HTML_COMMENT_RE.test(text) ||
    SETEXT_RE.test(text)
  );
}

function shouldCompleteSoftBreak(line, options) {
  const opts = options || {};
  const text = String(line || '');
  if (opts.inCodeFence) {
    return false;
  }
  if (!text || /^\s*$/.test(text)) {
    return false;
  }
  if (/ {2}$/.test(text) || /\\$/.test(text)) {
    return false;
  }
  if (isFenceToggle(text) || ATX_HEADING_RE.test(text) || THEMATIC_RE.test(text)) {
    return false;
  }
  if (CONTAINER_RE.test(text) || HTML_COMMENT_RE.test(text) || INDENTED_CODE_RE.test(text)) {
    return false;
  }
  return true;
}

function completeSoftBreakLine(line, options) {
  if (!shouldCompleteSoftBreak(line, options)) {
    return line;
  }
  return String(line).replace(/[ \t]+$/, '') + '  ';
}

function completeSoftBreaks(text, enabled) {
  if (!isSoftLineBreaksEnabled(enabled)) {
    return text;
  }
  if (typeof text !== 'string') {
    return text;
  }
  const lines = text.split('\n');
  let fence = false;
  const out = lines.map((line, index) => {
    if (isFenceToggle(line)) {
      fence = !fence;
      return line;
    }
    const next = lines[index + 1];
    if (next === undefined || isStructuralBreak(next)) {
      return line;
    }
    return completeSoftBreakLine(line, { inCodeFence: fence });
  });
  return out.join('\n');
}

function shouldHandleSoftBreakChange(change) {
  if (!change || typeof change !== 'object') {
    return false;
  }
  const origin = change.origin;
  if (origin === 'setValue' || origin === 'undo' || origin === 'redo') {
    return false;
  }
  const text = change.text;
  if (!Array.isArray(text) || text.length < 2) {
    return false;
  }
  const isPureNewline = text.length === 2 && text[0] === '' && text[1] === '';
  if (isPureNewline) {
    return true;
  }
  return origin === 'paste' || origin === 'drop';
}

function applySoftBreaksToChange(input) {
  const ctx = input || {};
  if (!isSoftLineBreaksEnabled(ctx.enabled)) {
    return null;
  }
  const changeText = ctx.changeText;
  if (!shouldHandleSoftBreakChange({ origin: ctx.origin, text: changeText })) {
    return null;
  }

  const next = changeText.slice();
  const prefix = String(ctx.linePrefix || '');
  let fence = Boolean(ctx.inCodeFence);

  const firstFull = prefix + next[0];
  const firstNext = next.length > 1 ? next[1] : '';
  // Enter is ['', '']; the empty second line is the new caret row, not a paragraph break.
  const isPureNewline = next.length === 2 && next[0] === '' && next[1] === '';
  if (isFenceToggle(firstFull)) {
    fence = !fence;
  } else if (
    shouldCompleteSoftBreak(firstFull, { inCodeFence: fence }) &&
    (isPureNewline || !isStructuralBreak(firstNext))
  ) {
    next[0] = completeSoftBreakLine(firstFull, { inCodeFence: fence }).slice(prefix.length);
  }

  for (let i = 1; i < next.length - 1; i += 1) {
    if (isFenceToggle(next[i])) {
      fence = !fence;
    } else if (!isStructuralBreak(next[i + 1])) {
      next[i] = completeSoftBreakLine(next[i], { inCodeFence: fence });
    }
  }

  let changed = false;
  for (let i = 0; i < next.length; i += 1) {
    if (next[i] !== changeText[i]) {
      changed = true;
      break;
    }
  }
  return changed ? next : null;
}

function handleEditorSoftBreakChange(change, context) {
  const ctx = context || {};
  const next = applySoftBreaksToChange({
    enabled: ctx.enabled,
    changeText: change && change.text,
    origin: change && change.origin,
    linePrefix: ctx.linePrefix,
    lineSuffix: ctx.lineSuffix,
    inCodeFence: ctx.inCodeFence,
  });
  if (!next || !change || typeof change.update !== 'function') {
    return false;
  }
  change.update(change.from, change.to, next);
  return true;
}

function readLinePrefix(cm, change) {
  if (!cm || !change || !change.from || typeof cm.getLine !== 'function') {
    return '';
  }
  const line = String(cm.getLine(change.from.line) || '');
  return line.slice(0, change.from.ch);
}

function readLineSuffix(cm, change) {
  if (!cm || !change || !change.to || typeof cm.getLine !== 'function') {
    return '';
  }
  const line = String(cm.getLine(change.to.line) || '');
  return line.slice(change.to.ch);
}

function softLineBreaksPlugin(options) {
  const opts = options || {};
  const getEnabled =
    typeof opts.getEnabled === 'function' ? opts.getEnabled : () => isSoftLineBreaksEnabled(opts.enabled);

  return {
    editorEffect(ctx) {
      if (!ctx || !ctx.editor || typeof ctx.editor.on !== 'function') {
        return undefined;
      }
      const cm = ctx.editor;
      const onBeforeChange = (instance, change) => {
        if (!getEnabled()) {
          return;
        }
        handleEditorSoftBreakChange(change, {
          enabled: true,
          linePrefix: readLinePrefix(instance, change),
          lineSuffix: readLineSuffix(instance, change),
          inCodeFence: isInsideCodeFenceFromDoc(
            (i) => instance.getLine(i),
            instance.lineCount(),
            change && change.from ? change.from.line : 0,
          ),
        });
      };
      cm.on('beforeChange', onBeforeChange);
      return () => {
        if (typeof cm.off === 'function') {
          cm.off('beforeChange', onBeforeChange);
        }
      };
    },
  };
}

module.exports = {
  applySoftBreaksToChange,
  completeSoftBreakLine,
  completeSoftBreaks,
  handleEditorSoftBreakChange,
  isFenceToggle,
  isInsideCodeFenceFromDoc,
  isStructuralBreak,
  isSoftLineBreaksEnabled,
  shouldCompleteSoftBreak,
  shouldHandleSoftBreakChange,
  softLineBreaksPlugin,
};
