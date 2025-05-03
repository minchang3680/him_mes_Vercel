// eslint.config.js
module.exports = {
    root: true,
    extends: ['next', 'next/core-web-vitals', 'eslint:recommended'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  };
  