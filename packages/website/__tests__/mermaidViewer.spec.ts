import { describe, expect, it } from "vitest";
import type { BytemdPlugin, BytemdViewerContext } from "bytemd";
import { mermaidForViewer } from "../components/Markdown/mermaidViewer";

type MermaidInit = {
  theme?: string;
  startOnLoad?: boolean;
  themeVariables?: { darkMode?: boolean };
};

function viewerContext(): BytemdViewerContext {
  const markdownBody = {
    closest: () => null,
    querySelectorAll: () => [],
  } as unknown as HTMLElement;
  const file = {
    value: "```mermaid\ngraph TD\nA-->B\n```",
    toString() {
      return "```mermaid\ngraph TD\nA-->B\n```";
    },
  } as BytemdViewerContext["file"];
  return { markdownBody, file };
}

function recordingPlugin() {
  const created: Array<MermaidInit | undefined> = [];
  const effectCalls: BytemdViewerContext[] = [];
  const cleanups: Array<string | undefined> = [];
  const createPlugin = (config?: MermaidInit): BytemdPlugin => {
    created.push(config);
    return {
      actions: [{ title: "mermaid" }],
      viewerEffect(ctx) {
        effectCalls.push(ctx);
        return () => {
          cleanups.push(config?.theme);
        };
      },
    };
  };
  return { created, effectCalls, cleanups, createPlugin };
}

describe("mermaid viewer effect contract", () => {
  it("forwards the full BytemdViewerContext, including file, and cleans up", () => {
    const recorded = recordingPlugin();
    const plugin = mermaidForViewer({ theme: "dark" }, recorded.createPlugin);
    const ctx = viewerContext();
    const cleanup = plugin.viewerEffect?.(ctx);

    expect(recorded.effectCalls).toEqual([ctx]);
    expect(recorded.effectCalls[0].file).toBe(ctx.file);
    expect(recorded.effectCalls[0].markdownBody).toBe(ctx.markdownBody);
    expect(recorded.created[1]).toMatchObject({
      startOnLoad: false,
      theme: "dark",
      themeVariables: { darkMode: true },
    });
    expect(typeof cleanup).toBe("function");
    if (typeof cleanup === "function") {
      cleanup();
    }
    expect(recorded.cleanups).toEqual(["dark"]);
  });

  it("initializes the light mermaid theme when the site theme is not dark", () => {
    const recorded = recordingPlugin();
    const plugin = mermaidForViewer({ theme: "light" }, recorded.createPlugin);
    plugin.viewerEffect?.(viewerContext());

    expect(recorded.created[1]).toMatchObject({
      startOnLoad: false,
      theme: "default",
    });
    expect(recorded.created[1]?.themeVariables).toBeUndefined();
  });
});
