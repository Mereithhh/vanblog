import { describe, expect, it } from "vitest";
import { getProcessor } from "bytemd";
import gfm from "@bytemd/plugin-gfm";
import {
  CODE_COPY_CLASS,
  CODE_COPY_CONTROL,
  CODE_COPY_LABEL,
  bindCodeCopyButtons,
  codeBlockPlugin,
  codeCopyIsKeyboardActivatable,
  copyCodeFromButton,
  customCodeBlock,
  describeCodeCopyControl,
  onClickCopyCode,
  readCodeFromCopyButton,
} from "../components/Markdown/codeBlock";
import { sanitizeMarkdownSchema } from "../utils/markdownSanitize";
import { dispatchKeyboardActivation } from "../utils/keyboardA11y";

const FENCED_JS = "```js\nconst answer = 42;\n```\n";
const FENCED_MERMAID = "```mermaid\ngraph TD\n  A-->B\n```\n";

function renderPublicCode(markdown: string) {
  return getProcessor({
    plugins: [gfm(), customCodeBlock()],
    remarkRehype: { allowDangerousHtml: true },
    sanitize: sanitizeMarkdownSchema,
  })
    .processSync(markdown)
    .toString();
}

function findCopyButton(tree: {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: unknown[];
}): { tagName: string; properties: Record<string, unknown> } | null {
  if (tree.tagName === "button" && tree.properties) {
    const cls = tree.properties.class ?? tree.properties.className;
    if (cls === CODE_COPY_CLASS || cls === CODE_COPY_CONTROL.className) {
      return { tagName: tree.tagName, properties: tree.properties };
    }
  }
  for (const child of tree.children || []) {
    const found = findCopyButton(child as Parameters<typeof findCopyButton>[0]);
    if (found) return found;
  }
  return null;
}

describe("code copy a11y model", () => {
  it("is a named native button that activates with Enter and Space", () => {
    const control = describeCodeCopyControl();
    expect(control).toMatchObject({
      tag: "button",
      type: "button",
      className: "code-copy-btn",
      ariaLabel: "复制代码",
      focusable: true,
    });
    expect(CODE_COPY_LABEL).toBe("复制代码");
    expect(codeCopyIsKeyboardActivatable("Enter")).toBe(true);
    expect(codeCopyIsKeyboardActivatable(" ")).toBe(true);
    expect(codeCopyIsKeyboardActivatable("Escape")).toBe(false);
  });
});

describe("code copy rehype + sanitize", () => {
  it("emits a <button type=button> with an accessible name", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "pre",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "code",
              properties: { className: ["language-js"] },
              children: [{ type: "text", value: "const answer = 42;" }],
            },
          ],
        },
      ],
    };
    codeBlockPlugin()(tree);
    const btn = findCopyButton(tree);
    expect(btn).toBeTruthy();
    expect(btn?.tagName).toBe("button");
    expect(btn?.properties.type).toBe("button");
    expect(btn?.properties.ariaLabel).toBe(CODE_COPY_LABEL);
    expect(btn?.properties.class).toBe(CODE_COPY_CLASS);
  });

  it("keeps the copy button through the public sanitizer", () => {
    const html = renderPublicCode(FENCED_JS);
    expect(html).toMatch(/<button\b[^>]*class="code-copy-btn"/);
    expect(html).toMatch(/<button\b[^>]*type="button"/);
    expect(html).toMatch(/aria-label="复制代码"/);
    expect(html).not.toMatch(/<div class="code-copy-btn"/);
  });

  it("does not add a copy control on mermaid fences", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "pre",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "code",
              properties: { className: ["language-mermaid"] },
              children: [{ type: "text", value: "graph TD" }],
            },
          ],
        },
      ],
    };
    codeBlockPlugin()(tree);
    expect(findCopyButton(tree)).toBeNull();
  });
});

describe("code copy keyboard activation", () => {
  const mockBtn = {
    parentElement: {
      parentElement: {
        querySelector: (selector: string) => {
          expect(selector).toBe("code");
          return { innerText: "const answer = 42;" };
        },
      },
    },
  };

  it("copies the fenced code when the control is activated", () => {
    const copied: string[] = [];
    const toasts: string[] = [];
    copyCodeFromButton(mockBtn, {
      copy: (text) => {
        copied.push(text);
      },
      toastSuccess: (message) => {
        toasts.push(message);
      },
    });
    expect(readCodeFromCopyButton(mockBtn)).toBe("const answer = 42;");
    expect(copied).toEqual(["const answer = 42;"]);
    expect(toasts).toEqual(["复制成功"]);
  });

  it("triggers copy on Enter and Space the same way a native button click would", () => {
    const copied: string[] = [];
    const activate = () => {
      copyCodeFromButton(mockBtn, {
        copy: (text) => {
          copied.push(text);
        },
        toastSuccess: () => undefined,
      });
    };

    expect(dispatchKeyboardActivation("button", "Enter", activate)).toBe(true);
    expect(dispatchKeyboardActivation("button", " ", activate)).toBe(true);
    expect(dispatchKeyboardActivation("div", "Enter", activate)).toBe(false);
    expect(copied).toEqual(["const answer = 42;", "const answer = 42;"]);
  });

  it("binds a click listener on the copy control (native Enter/Space fire click)", () => {
    const listeners: Record<string, EventListener[]> = {};
    const copyBtn = {
      removeEventListener: (type: string, handler: EventListener) => {
        listeners[type] = (listeners[type] || []).filter((h) => h !== handler);
      },
      addEventListener: (type: string, handler: EventListener) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(handler);
      },
    };
    const markdownBody = {
      querySelectorAll: () => [
        {
          querySelector: (selector: string) => {
            expect(selector).toBe(`.${CODE_COPY_CLASS}`);
            return copyBtn;
          },
        },
      ],
    };

    bindCodeCopyButtons(markdownBody as unknown as ParentNode);
    expect(listeners.click).toEqual([onClickCopyCode]);
  });
});
