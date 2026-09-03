import { isTrue } from './isTrue';

export type WalineLoginMode = 'force' | 'enable';

export function isForceLoginCommentEnabled(value: unknown): boolean {
  if (value === 1 || value === '1') {
    return true;
  }
  return isTrue(value as boolean | string);
}

export function resolveWalineLoginMode(value: unknown): WalineLoginMode {
  return isForceLoginCommentEnabled(value) ? 'force' : 'enable';
}

/**
 * Waline server rule (logic/comment.js postAction):
 * logged-in users may always post; guests are rejected when LOGIN=force.
 */
export function authorizeCommentPost(options: {
  forceLoginComment: unknown;
  userInfo?: { objectId?: string } | null;
}): { ok: true } | { ok: false; status: 401 } {
  const loggedIn = Boolean(options.userInfo && options.userInfo.objectId);
  if (loggedIn) {
    return { ok: true };
  }
  if (isForceLoginCommentEnabled(options.forceLoginComment)) {
    return { ok: false, status: 401 };
  }
  return { ok: true };
}
