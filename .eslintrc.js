/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    ignorePatterns: ['node_modules', '.github', 'dist'],
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:cypress/recommended',
        'prettier',
    ],
    env: {
        node: true,
        'vue/setup-compiler-macros': true,
    },
    rules: {
        'no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                destructuredArrayIgnorePattern: '^_',
            },
        ],
    },
    globals: {
        VITE_ENVIRONMENT: true,
        __APP_VERSION__: true,
    },
    overrides: [
        {
            files: ['tests/**/*.{js,ts,jsx,tsx}', 'src/**/__test__/**/*.spec.js'],
            rules: {
                'no-prototype-builtins': 'off',
            },
        },
        {
            files: ['*.md'],
            excludedFiles: ['LICENSE.md'],
            parser: 'eslint-plugin-markdownlint/parser',
            extends: ['plugin:markdownlint/recommended'],
            rules: {
                'markdownlint/md013': 'off',
                'markdownlint/md028': 'off',
                'no-irregular-whitespace': 'off',
            },
        },
    ],
}
