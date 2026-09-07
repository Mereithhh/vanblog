import mermaidPlugin from "@bytemd/plugin-mermaid";
import type { BytemdPlugin } from "bytemd";
import {
  applyMermaidThemeToTree,
  detectPaintIsDark,
  isDarkPaintTheme,
  mermaidInitConfig,
  watchMermaidContainers,
} from "../../utils/mermaidTheme";

export function mermaidForViewer(options?: { theme?: string }): BytemdPlugin {
  const official = mermaidPlugin();
  return {
    ...official,
    viewerEffect({ markdownBody }) {
      const isDark =
        detectPaintIsDark(markdownBody) || isDarkPaintTheme(options?.theme);
      const themed = mermaidPlugin(mermaidInitConfig(isDark));
      applyMermaidThemeToTree(markdownBody, isDark);
      const cleanup = themed.viewerEffect?.({ markdownBody });
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
