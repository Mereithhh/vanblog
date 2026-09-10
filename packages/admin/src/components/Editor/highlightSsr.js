const highlight = require('@bytemd/plugin-highlight-ssr');
const armasm = require('highlight.js/lib/languages/armasm');
const x86asm = require('highlight.js/lib/languages/x86asm');

/** Same extra grammars / aliases as the public website highlighter (#294). */
const ASM_HIGHLIGHT_LANGUAGES = { x86asm, armasm };
const ASM_HIGHLIGHT_ALIASES = {
  x86asm: ['asm', 'assembly', 'nasm', 'intel', 'x86'],
  armasm: ['arm'],
};

function highlightSsr() {
  return highlight({
    languages: ASM_HIGHLIGHT_LANGUAGES,
    aliases: ASM_HIGHLIGHT_ALIASES,
  });
}

module.exports = {
  ASM_HIGHLIGHT_ALIASES,
  ASM_HIGHLIGHT_LANGUAGES,
  highlightSsr,
};
