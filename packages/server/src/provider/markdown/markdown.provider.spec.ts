import hljs from 'highlight.js';
import { MarkdownProvider } from './markdown.provider';

const ASM = `\`\`\`asm
    mov eax, 1      ; sys_exit
    xor ebx, ebx
    int 0x80
\`\`\`
`;

describe('MarkdownProvider assembly highlighting (#294)', () => {
  const provider = new MarkdownProvider();

  it('registers asm / nasm / intel as aliases of highlight.js x86asm', () => {
    const x86Name = hljs.getLanguage('x86asm')?.name;
    expect(x86Name).toBeTruthy();
    expect(hljs.getLanguage('asm')?.name).toBe(x86Name);
    expect(hljs.getLanguage('nasm')?.name).toBe(x86Name);
    expect(hljs.getLanguage('intel')?.name).toBe(x86Name);
  });

  it('tokenizes ```asm in RSS / markdown-it output', () => {
    const html = provider.renderMarkdown(ASM);
    expect(html).toMatch(/hljs-keyword/);
    expect(html).toMatch(/hljs-built_in/);
    expect(html).toMatch(/hljs-comment/);
    expect(html).toContain('mov');
    expect(html).toContain('eax');
    expect(html).toContain('sys_exit');
  });
});
