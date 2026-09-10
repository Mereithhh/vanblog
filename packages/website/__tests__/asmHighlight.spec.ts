import { describe, expect, it } from "vitest";
import { getProcessor } from "bytemd";
import gfm from "@bytemd/plugin-gfm";
import { customCodeBlock } from "../components/Markdown/codeBlock";
import { highlightSsr } from "../components/Markdown/highlightSsr";
import { sanitizeMarkdownSchema } from "../utils/markdownSanitize";

/** Intel/NASM sample: keywords, registers, comment, hex immediate. */
export const FENCED_ASM = `\`\`\`asm
section .text
global _start
_start:
    mov eax, 1      ; sys_exit
    xor ebx, ebx
    int 0x80
\`\`\`
`;

const FENCED_NASM = FENCED_ASM.replace("```asm", "```nasm");
const FENCED_X86ASM = FENCED_ASM.replace("```asm", "```x86asm");
const FENCED_ARM = `\`\`\`arm
    mov r0, #0
    bx lr
\`\`\`
`;

function renderPublicAsm(markdown: string) {
  return getProcessor({
    plugins: [gfm(), highlightSsr(), customCodeBlock()],
    remarkRehype: { allowDangerousHtml: true },
    sanitize: sanitizeMarkdownSchema,
  })
    .processSync(markdown)
    .toString();
}

function assertIntelTokens(html: string) {
  expect(html).toMatch(/hljs/);
  expect(html).toMatch(/<span[^>]*class="[^"]*hljs-keyword[^"]*"[^>]*>mov<\/span>/);
  expect(html).toMatch(/<span[^>]*class="[^"]*hljs-keyword[^"]*"[^>]*>xor<\/span>/);
  expect(html).toMatch(/<span[^>]*class="[^"]*hljs-built_in[^"]*"[^>]*>eax<\/span>/);
  expect(html).toMatch(/<span[^>]*class="[^"]*hljs-built_in[^"]*"[^>]*>ebx<\/span>/);
  expect(html).toMatch(/hljs-comment/);
  expect(html).toContain("sys_exit");
  expect(html).toMatch(/0x80/);
}

describe("public assembly fence highlighting (#294)", () => {
  it("tokenizes ```asm with keyword / register / comment classes", () => {
    const html = renderPublicAsm(FENCED_ASM);
    expect(html).toMatch(/language-asm/);
    assertIntelTokens(html);
  });

  it("accepts nasm and x86asm fence tags", () => {
    assertIntelTokens(renderPublicAsm(FENCED_NASM));
    assertIntelTokens(renderPublicAsm(FENCED_X86ASM));
    expect(renderPublicAsm(FENCED_NASM)).toMatch(/language-nasm/);
    expect(renderPublicAsm(FENCED_X86ASM)).toMatch(/language-x86asm/);
  });

  it("tokenizes ARM assembly fences", () => {
    const html = renderPublicAsm(FENCED_ARM);
    expect(html).toMatch(/language-arm/);
    expect(html).toMatch(/<span[^>]*class="[^"]*hljs-keyword[^"]*"[^>]*>mov<\/span>/);
    expect(html).toMatch(/<span[^>]*class="[^"]*hljs-built_in[^"]*"[^>]*>r0<\/span>/);
    expect(html).toMatch(/hljs-keyword/);
  });

  it("still highlights javascript after registering assembly", () => {
    const html = renderPublicAsm("```js\nconst answer = 42;\n```\n");
    expect(html).toMatch(/<span[^>]*class="[^"]*hljs-keyword[^"]*"[^>]*>const<\/span>/);
  });
});
