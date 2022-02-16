module.exports = {
  plugins: [
    'stylelint-order',
    'stylelint-scss',
  ],
  extends: [
    'stylelint-config-recommended-scss',
    'stylelint-config-property-sort-order-smacss',
  ],
  rules: {
    'declaration-block-no-duplicate-properties': true,
    'number-leading-zero': 'never',
    'selector-combinator-space-after': 'always',
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['export'] },
    ],
    'string-quotes': 'single',
  },
};
