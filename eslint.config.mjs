import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic:  true,
  typescript: true,
  isInEditor: true,
  javascript: true,
  jsonc:      true,
  yaml:       true,
}, {
  rules: {
    'antfu/if-newline':          'off',
    'antfu/no-top-level-await':  'off',
    'no-console':                'off',
    'style/no-floating-decimal': 'off',
    'no-sequences':              'off',
    'prefer-arrow-callback':     'off',

    'style/key-spacing': [
      'warn',
      { multiLine: { beforeColon: false, afterColon: true }, align: { beforeColon: false, afterColon: true, on: 'value' } },
    ],
    'style/max-statements-per-line': ['warn', { max: 2 }],
    'style/no-multi-spaces':         'off',
    'style/quotes':                  ['warn', 'single', { avoidEscape: true }],
  },
})
