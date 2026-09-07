/**
 * Shared tokenizers for article / draft tag Select fields (Ant Design mode="tags").
 *
 * Separators are English/Chinese commas, semicolons, and newlines — the usual
 * delimiters when pasting a list from notes or AI output (#489).
 *
 * Spaces are intentionally NOT separators so multi-word tags such as
 * "machine learning" stay a single tag. Trim around each token instead.
 */

const TAG_TOKEN_SEPARATORS = Object.freeze([',', '，', ';', '；', '\n', '\r']);

const TAG_FIELD_PLACEHOLDER = '选择、输入或粘贴多个标签（逗号 / 分号 / 换行分隔）';

const TAG_FIELD_TOOLTIP =
  '可一次粘贴多个标签。用英文/中文逗号、分号或换行分隔；空格不会拆开，以便保留「machine learning」这类多词标签。';

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const TAG_TOKEN_SPLIT_PATTERN = new RegExp(
  TAG_TOKEN_SEPARATORS.map(escapeRegExp).join('|'),
);

/**
 * Split a pasted or typed tag list into trimmed, non-empty tags.
 * Consecutive separators and surrounding whitespace are dropped.
 *
 * @param {unknown} input
 * @returns {string[]}
 */
function splitTagInput(input) {
  if (input == null) {
    return [];
  }
  const text = String(input);
  if (!text.trim()) {
    return [];
  }
  return text
    .split(TAG_TOKEN_SPLIT_PATTERN)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

module.exports = {
  TAG_TOKEN_SEPARATORS,
  TAG_FIELD_PLACEHOLDER,
  TAG_FIELD_TOOLTIP,
  splitTagInput,
};
