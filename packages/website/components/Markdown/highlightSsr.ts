import highlight from "@bytemd/plugin-highlight-ssr";
import armasm from "highlight.js/lib/languages/armasm";
import x86asm from "highlight.js/lib/languages/x86asm";

/**
 * ByteMD highlight-ssr with assembly grammars.
 * The plugin's default lowlight "common" set has no x86asm / armasm, so
 * ```asm / ```nasm fences stay untokenized. These extras are additive.
 */
export const ASM_HIGHLIGHT_LANGUAGES = { x86asm, armasm };

/** `asm` is the fence users write; highlight.js only ships nasm/intel/x86. */
export const ASM_HIGHLIGHT_ALIASES = {
  x86asm: ["asm", "assembly", "nasm", "intel", "x86"],
  armasm: ["arm"],
};

export function highlightSsr() {
  return highlight({
    languages: ASM_HIGHLIGHT_LANGUAGES,
    aliases: ASM_HIGHLIGHT_ALIASES,
  });
}
