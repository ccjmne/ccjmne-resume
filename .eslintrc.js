module.exports = {
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
    },
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  env: { es2021: true },
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true,
    },
  },
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['webpack.config.ts'] }],
    'quotes': ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
    'indent': ['error', 2],
    'import/extensions': ['error', 'never'],
    'semi': ['error', 'always'],
    'max-len': ['error', 140, { ignoreTrailingComments: true }],
    'no-shadow': ['error', { allow: ['_'] }],
    'linebreak-style': ['error', 'unix'],
    'quote-props': ['error', 'consistent-as-needed'],
    'object-curly-newline': ['error', {
      ImportDeclaration: 'never',
      ObjectExpression: { consistent: true, multiline: true },
      ObjectPattern: { consistent: true, multiline: true },
    }],
  },
};
