module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },
  rules: {
    'react/no-find-dom-node': process.env.NODE_ENV === 'development' ? 'warn' : 'error',
    'react/no-deprecated': process.env.NODE_ENV === 'development' ? 'warn' : 'error',
    'react/jsx-props-no-spreading': 'off',
  },
};
