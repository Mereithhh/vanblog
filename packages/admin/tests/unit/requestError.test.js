const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  SESSION_EXPIRED_MESSAGE,
  LOGIN_SUCCESS_MESSAGE,
  FORBIDDEN_MESSAGE,
  SILENT_SHOW_TYPE,
  adaptAdminResponse,
  handleAdminRequestError,
  hasJustLoggedIn,
  isAdminLoginPath,
  isSessionExpiredError,
  isSessionExpiredPayload,
  markLoginSuccess,
  notifyLoginSuccess,
  resetRequestErrorState,
  shouldShowRequestError,
  shouldSuppressSessionExpiredToast,
} = require('../../src/services/van-blog/requestError');

function expiredError(extras = {}) {
  return {
    name: 'ResponseError',
    message: 'Unauthorized',
    data: { statusCode: 401, message: 'Unauthorized' },
    response: { status: 401 },
    ...extras,
  };
}

function createMessageApi() {
  const calls = [];
  return {
    calls,
    error(text) {
      calls.push({ type: 'error', text });
    },
    success(text) {
      calls.push({ type: 'success', text });
    },
    destroy() {
      calls.push({ type: 'destroy' });
    },
  };
}

describe('admin request error toasts (#316)', () => {
  beforeEach(() => {
    resetRequestErrorState();
  });

  it('maps JWT Unauthorized to 登录失效 and Forbidden resource to 权限不足', () => {
    assert.deepEqual(adaptAdminResponse({ statusCode: 401, message: 'Unauthorized' }), {
      statusCode: 401,
      message: 'Unauthorized',
      success: false,
      errorMessage: SESSION_EXPIRED_MESSAGE,
    });
    assert.equal(
      adaptAdminResponse({ statusCode: 403, message: 'Forbidden resource' }).errorMessage,
      FORBIDDEN_MESSAGE,
    );
    assert.equal(adaptAdminResponse({ statusCode: 200, data: {} }).success, true);
    assert.equal(adaptAdminResponse({ statusCode: 233, data: {} }).success, true);
  });

  it('still surfaces wrong-password 401 so login failures are visible', () => {
    const res = adaptAdminResponse({
      statusCode: 401,
      message: '用户名或密码错误！',
    });
    assert.equal(res.success, false);
    assert.equal(res.errorMessage, '用户名或密码错误！');
    assert.equal(res.showType, undefined);
    assert.equal(isSessionExpiredPayload({ statusCode: 401, message: '用户名或密码错误！' }), false);
    assert.equal(
      shouldShowRequestError({
        data: { statusCode: 401, message: '用户名或密码错误！' },
      }),
      true,
    );
  });

  it('treats /user/login and /admin/user/login as the admin login page', () => {
    assert.equal(isAdminLoginPath('/user/login'), true);
    assert.equal(isAdminLoginPath('/admin/user/login'), true);
    assert.equal(isAdminLoginPath('/admin/user/login?redirect=/article'), true);
    assert.equal(isAdminLoginPath('/article'), false);
    assert.equal(isAdminLoginPath('/user/restore'), false);
  });

  it('silences session-expired toasts on the login page and shortly after re-login', () => {
    const expired = { statusCode: 401, message: 'Unauthorized' };
    assert.equal(shouldSuppressSessionExpiredToast({ pathname: '/article' }), false);
    assert.equal(shouldSuppressSessionExpiredToast({ pathname: '/user/login' }), true);

    const onArticle = adaptAdminResponse(expired, { pathname: '/article' });
    assert.equal(onArticle.errorMessage, SESSION_EXPIRED_MESSAGE);
    assert.equal(onArticle.showType, undefined);

    const onLogin = adaptAdminResponse(expired, { pathname: '/user/login' });
    assert.equal(onLogin.showType, SILENT_SHOW_TYPE);

    markLoginSuccess(1_000);
    assert.equal(hasJustLoggedIn(1_100), true);
    assert.equal(shouldSuppressSessionExpiredToast({ pathname: '/article', now: 1_100 }), true);
    assert.equal(
      adaptAdminResponse(expired, { pathname: '/article', now: 1_100 }).showType,
      SILENT_SHOW_TYPE,
    );
    assert.equal(shouldSuppressSessionExpiredToast({ pathname: '/article', now: 8_000 }), false);
  });

  it('does not show a failure toast for a stale 401 after successful login', () => {
    const stale = expiredError();
    assert.equal(shouldShowRequestError(stale, { pathname: '/article' }), true);
    assert.equal(isSessionExpiredError(stale), true);

    markLoginSuccess(5_000);
    assert.equal(shouldShowRequestError(stale, { pathname: '/article', now: 5_200 }), false);
    assert.equal(shouldShowRequestError(stale, { pathname: '/user/login', now: 20_000 }), false);

    const skipped = expiredError({
      request: { options: { skipErrorHandler: true } },
    });
    assert.equal(shouldShowRequestError(skipped, { pathname: '/article' }), false);
  });

  it('notifyLoginSuccess clears pending errors before showing only success', () => {
    const api = createMessageApi();
    api.error(SESSION_EXPIRED_MESSAGE);

    notifyLoginSuccess(api, LOGIN_SUCCESS_MESSAGE, 9_000);

    assert.deepEqual(api.calls, [
      { type: 'error', text: SESSION_EXPIRED_MESSAGE },
      { type: 'destroy' },
      { type: 'success', text: LOGIN_SUCCESS_MESSAGE },
    ]);
    assert.equal(hasJustLoggedIn(9_100), true);
    assert.equal(
      api.calls.some((row) => row.type === 'error' && row.type === 'success'),
      false,
    );
    const visibleAfter = api.calls.filter((row, idx, all) => {
      const destroyedAt = all.findIndex((item) => item.type === 'destroy');
      return idx > destroyedAt && (row.type === 'error' || row.type === 'success');
    });
    assert.deepEqual(visibleAfter, [{ type: 'success', text: LOGIN_SUCCESS_MESSAGE }]);
  });

  it('handleAdminRequestError swallows the expired-request race after re-login', () => {
    const api = createMessageApi();
    markLoginSuccess(2_000);

    assert.throws(
      () =>
        handleAdminRequestError(expiredError(), {
          message: api,
          pathname: '/article',
          now: 2_100,
        }),
      (err) => err.data && err.data.message === 'Unauthorized',
    );
    assert.deepEqual(api.calls, []);

    resetRequestErrorState();
    assert.throws(
      () =>
        handleAdminRequestError(expiredError(), {
          message: api,
          pathname: '/article',
          now: 2_100,
        }),
      (err) => err.data && err.data.message === 'Unauthorized',
    );
    assert.deepEqual(api.calls, [{ type: 'error', text: SESSION_EXPIRED_MESSAGE }]);
  });

  it('login page and request config use the helper so success cannot stack with 登录失效', () => {
    const loginSrc = readFileSync(
      path.join(__dirname, '../../src/pages/user/Login/index.jsx'),
      'utf8',
    );
    const appSrc = readFileSync(path.join(__dirname, '../../src/app.jsx'), 'utf8');
    assert.match(loginSrc, /notifyLoginSuccess/);
    assert.match(loginSrc, /requestError/);
    assert.doesNotMatch(loginSrc, /message\.success\(defaultLoginSuccessMessage\)/);
    assert.match(appSrc, /adaptAdminResponse/);
    assert.match(appSrc, /handleAdminRequestError/);
    assert.match(appSrc, /requestError/);
  });
});
