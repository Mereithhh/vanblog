/**
 * Private articles and categories must have a non-empty password.
 * Whitespace alone does not count.
 */

const PRIVATE_PASSWORD_REQUIRED_MESSAGE = '如若加密，请填写密码！';

function hasPrivatePassword(password) {
  return String(password ?? '').trim().length > 0;
}

function isPrivateChecked(isPrivate) {
  return isPrivate === true || isPrivate === 'true' || isPrivate === 1 || isPrivate === '1';
}

function privatePasswordError(isPrivate, password) {
  if (isPrivateChecked(isPrivate) && !hasPrivatePassword(password)) {
    return PRIVATE_PASSWORD_REQUIRED_MESSAGE;
  }
  return '';
}

function privatePasswordFieldRules(privateFieldName) {
  return [
    ({ getFieldValue }) => ({
      validator(_rule, value) {
        const message = privatePasswordError(getFieldValue(privateFieldName), value);
        if (message) {
          return Promise.reject(new Error(message));
        }
        return Promise.resolve();
      },
    }),
  ];
}

module.exports = {
  PRIVATE_PASSWORD_REQUIRED_MESSAGE,
  hasPrivatePassword,
  isPrivateChecked,
  privatePasswordError,
  privatePasswordFieldRules,
};
