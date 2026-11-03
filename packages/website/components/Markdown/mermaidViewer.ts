import mermaidPlugin from "@bytemd/plugin-mermaid";
import type { BytemdPlugin, BytemdViewerContext } from "bytemd";
import {
  applyMermaidThemeToTree,
  detectPaintIsDark,
  isDarkPaintTheme,
  mermaidInitConfig,
  watchMermaidContainers,
} from "../../utils/mermaidTheme";

type MermaidPluginFactory = (
  options?: Parameters<typeof mermaidPlugin>[0],
) => BytemdPlugin;

export function mermaidForViewer(
  options?: { theme?: string },
  createPlugin: MermaidPluginFactory = mermaidPlugin,
): BytemdPlugin {
  const official = createPlugin();
  return {
    ...official,
    viewerEffect(ctx: BytemdViewerContext) {
      const { markdownBody } = ctx;
      const isDark =
        detectPaintIsDark(markdownBody) || isDarkPaintTheme(options?.theme);
      const themed = createPlugin(mermaidInitConfig(isDark));
      applyMermaidThemeToTree(markdownBody, isDark);
      const cleanup = themed.viewerEffect?.(ctx);
      const stopWatch = watchMermaidContainers(markdownBody, isDark);
      return () => {
        if (typeof cleanup === "function") {
          cleanup();
        }
        stopWatch();
      };
    },
  };
}
