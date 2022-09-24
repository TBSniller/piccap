module.exports = {
  env: {
    browser: true,
  },
  extends: [
    'airbnb-base',
    'plugin:compat/recommended'
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 0,
    'no-bitwise': 0,
    'no-await-in-loop': 0,
    'no-constant-condition': 0
  },
};
