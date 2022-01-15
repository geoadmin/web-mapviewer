module.exports = {
    root: true,
    env: {
        node: true,
        mocha: true,
    },
    extends: [
        'plugin:vue/essential',
        'plugin:vue/recommended',
        'plugin:cypress/recommended',
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:prettier-vue/recommended',
        'prettier',
    ],
    parserOptions: {
        parser: 'babel-eslint',
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
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
