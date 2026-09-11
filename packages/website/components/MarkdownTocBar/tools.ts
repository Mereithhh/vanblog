import { getProcessor } from "bytemd";
import gfm from "@bytemd/plugin-gfm";
import { visit } from "unist-util-visit";
import { Heading } from "../Markdown/heading";
import { sanitizeMarkdownSchema } from "../../utils/markdownSanitize";
import { normalizeHeadingText } from "../../utils/headingText";

export interface NavItem {
  index: number;
  level: number;
  listNo: string;
  text: string;
}

export { normalizeHeadingText };

/**
 * Strip markdown that would confuse a regex TOC scan (`/#+\s(.+)\n/g`).
 *
 * Each step is a lossy string transform; **order matters**. Fences must go
 * first so later `#` filters never see code. Historically `parseNavStructure`
 * washed then matched ATX-like lines; it now reads rendered h1–h6 instead.
 * This helper is kept so the pipeline stays documented and regression-tested
 * (#203, #208).
 */
export const washMarkdownContent = (source: string) => {
  if (!source) return "";
  const withoutFences = stripFencedCodeBlocks(source);
  const withoutInlineHashCode = stripInlineBacktickHash(withoutFences);
  const fromFirstHeading = dropLeadingNonHeadingPrefix(withoutInlineHashCode);
  const withoutMidLineHashes = dropInlineHashLines(fromFirstHeading);
  const withoutCodeTicks = unwrapInlineCode(withoutMidLineHashes);
  const withoutAsterisks = unwrapAsteriskEmphasis(withoutCodeTicks);
  const withoutUnderscores = unwrapUnderscoreEmphasis(withoutAsterisks);
  // Old `/#+\s(.+)\n/g` needs a trailing newline to match the last heading.
  return withoutUnderscores.trim() + "\n";
};

/** Drop ``` fences so `#` comments / `#include` inside code are not treated as headings. */
function stripFencedCodeBlocks(source: string): string {
  // Closing fences are the sequence ``` — a character class of backticks
  // only means "not a backtick" and cannot match a fence.
  return source.replace(/```([\s\S]*?)```[\s]*/g, "");
}

/**
 * Drop a backtick immediately followed by `#` (`` `#id` `` / `` `# heading` ``)
 * so that `#` does not leak into later heading filters.
 */
function stripInlineBacktickHash(source: string): string {
  return source.replace(/`#/g, "");
}

/**
 * Drop the preamble before the first `#`. `[^#]` includes newlines, so this
 * is the whole prefix through the newline immediately before the first `#`,
 * not merely the first line. `^` is not multiline; `g` is historical.
 */
function dropLeadingNonHeadingPrefix(source: string): string {
  return source.replace(/^[^#]+\n/g, "");
}

/**
 * 行内出现的 `#`（如 `see # Notes`）不是 ATX 标题（标题需在行首），但旧的
 * `/#+\s(.+)\n/g` 仍会匹配，故整段删掉。Indented `  ## Nested` also matches
 * here (spaces before `#`) — that is current wash behavior, locked by tests.
 */
function dropInlineHashLines(source: string): string {
  return source.replace(/(?:[^\n#]+)#+\s([^#\n]+)\n*/g, "");
}

/** Keep inner words of `` `code` `` so heading text matches what readers see. */
function unwrapInlineCode(source: string): string {
  return source.replace(/`([^`\n]+)`/g, "$1");
}

/** Strip `*` / `**` around a run of text so `## **Bold**` becomes `## Bold`. */
function unwrapAsteriskEmphasis(source: string): string {
  return source.replace(/\*\*?([^*\n]+)\*\*?/g, "$1");
}

/** Same intent as asterisks, for `_italic_` / `__bold__`. */
function unwrapUnderscoreEmphasis(source: string): string {
  return source.replace(/__?([^_\n]+)__?/g, "$1");
}

function headingDataId(node: { properties?: Record<string, unknown> }): string {
  const props = node.properties || {};
  return normalizeHeadingText(
    (props["data-id"] ?? props.dataId) as string | undefined
  );
}

/** Same heading pipeline as the public article Viewer, so TOC matches rendered h1–h6. */
function extractRenderedHeadings(source: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  getProcessor({
    plugins: [
      gfm(),
      Heading(),
      {
        rehype: (processor) =>
          processor.use(() => (tree) => {
            visit(tree, (node: any) => {
              if (node?.type !== "element") return;
              const tag = String(node.tagName || "");
              if (!/^h[1-6]$/.test(tag)) return;
              const text = headingDataId(node);
              if (!text) return;
              headings.push({
                level: Number(tag.slice(1)),
                text,
              });
            });
          }),
      },
    ],
    remarkRehype: { allowDangerousHtml: true },
    sanitize: sanitizeMarkdownSchema,
  }).processSync(source || "");
  return headings;
}

export const parseNavStructure = (source: string): NavItem[] => {
  const navData = extractRenderedHeadings(source).map((item, i) => ({
    index: i,
    level: item.level,
    text: item.text,
    listNo: "",
  }));

  let maxLevel = 0;
  navData.forEach((t) => {
    if (t.level > maxLevel) {
      maxLevel = t.level;
    }
  });
  let matchStack = [];
  // 此部分重构，原有方法会出现次级标题后再次出现高级标题时，listNo重复的bug
  for (let i = 0; i < navData.length; i++) {
    const t: any = navData[i];
    const { level } = t;
    while (
      matchStack.length &&
      matchStack[matchStack.length - 1].level > level
    ) {
      matchStack.pop();
    }
    if (matchStack.length === 0) {
      const arr = new Array(maxLevel).fill(0);
      arr[level - 1] += 1;
      matchStack.push({
        level,
        arr,
      });
      t.listNo = trimArrZero(arr).join(".");
      continue;
    }
    const { arr } = matchStack[matchStack.length - 1] as any;
    const newArr = arr.slice();
    newArr[level - 1] += 1;
    matchStack.push({
      level,
      arr: newArr,
    });
    t.listNo = trimArrZero(newArr).join(".");
  }
  return navData as NavItem[];
};

const trimArrZero = (arr: any) => {
  let start, end;
  for (start = 0; start < arr.length; start++) {
    if (arr[start]) {
      break;
    }
  }
  for (end = arr.length - 1; end >= 0; end--) {
    if (arr[end]) {
      break;
    }
  }
  return arr.slice(start, end + 1);
};
export const getEl = (item: NavItem, all: NavItem[]) => {
  const tagName = `h${item.level}`;
  const target = normalizeHeadingText(item.text);
  const els = Array.from(document.querySelectorAll(`${tagName}[data-id]`)).filter(
    (el) => normalizeHeadingText(el.getAttribute("data-id")) === target
  );
  if (els.length > 1) {
    // 相同的规则找 index
    const index = all
      .filter((j) => {
        return (
          j.level == item.level &&
          normalizeHeadingText(j.text) === target
        );
      })
      .findIndex((val) => {
        if (val.index == item.index) {
          return true;
        }
        return false;
      });
    return els[index];
  } else {
    return els[0];
  }
};
