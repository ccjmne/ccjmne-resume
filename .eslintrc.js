module.exports = {
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  env: { es2021: true },
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['webpack.config.ts'] }],
    'quotes': ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
    'indent': ['error', 2],
    'semi': ['error', 'always'],
    'max-len': ['error', 140, { ignoreTrailingComments: true }],
    'linebreak-style': ['error', 'unix'],
    'quote-props': ['error', 'consistent-as-needed'],
    'object-curly-newline': ['error', {
      ImportDeclaration: 'never',
      ObjectExpression: { consistent: true, multiline: true },
      ObjectPattern: { consistent: true, multiline: true },
    }],
  },
};
