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
    settings: {},
}
