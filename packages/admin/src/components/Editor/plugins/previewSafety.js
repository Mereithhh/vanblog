'use strict';

/**
 * ByteMD runs `viewerEffect` in Svelte `afterUpdate`. A throw there is not
 * caught by Viewer's `processSync` try/catch and becomes the admin
 * "Something went wrong" overlay (#429, same class as #391/#424/#477).
 */
function withSafeViewerEffect(plugin) {
  if (!plugin || typeof plugin !== 'object') {
    return plugin;
  }
  const original = plugin.viewerEffect;
  if (typeof original !== 'function') {
    return plugin;
  }
  return {
    ...plugin,
    viewerEffect(ctx) {
      try {
        const cleanup = original.call(plugin, ctx);
        if (typeof cleanup !== 'function') {
          return cleanup;
        }
        return () => {
          try {
            cleanup();
          } catch {
            // Preview teardown must not unmount the editor.
          }
        };
      } catch {
        return undefined;
      }
    },
  };
}

function withSafeViewerEffects(plugins) {
  if (!Array.isArray(plugins)) {
    return [];
  }
  return plugins.map(withSafeViewerEffect);
}

module.exports = {
  withSafeViewerEffect,
  withSafeViewerEffects,
};
