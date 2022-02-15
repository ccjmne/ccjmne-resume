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
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['export'] },
    ],
  },
};
