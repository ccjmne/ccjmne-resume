module.exports = {
  extends: [
    'stylelint-config-standard-scss',
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
