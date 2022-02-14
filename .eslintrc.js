module.exports = {
    root: true,
    env: {
        node: true,
        mocha: true,
    },
    extends: [
        'plugin:vue/vue3-essential',
        'plugin:vue/vue3-recommended',
        'plugin:cypress/recommended',
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:prettier-vue/recommended',
        'prettier',
    ],
    parserOptions: {
        parser: '@babel/eslint-parser',
    },
    rules: {
        'no-console': 'warn',
        'no-debugger': 'warn',
        curly: 'error',
        'import/extensions': ['error', { js: 'never', vue: 'always', json: 'always' }],
    },
    overrides: [
        {
            files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
            env: {
                jest: true,
                mocha: true,
            },
        },
    ],
    settings: {
        'import/resolver': {
            alias: {
                map: [['@', './src']],
                extensions: ['.vue', '.json', '.js'],
            },
        },
    },
}
