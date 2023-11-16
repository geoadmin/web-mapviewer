/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    ignorePatterns: ['node_modules', '.github', 'dist'],
    extends: ['plugin:vue/vue3-recommended', 'prettier'],
    env: {
        'vue/setup-compiler-macros': true,
    },
    overrides: [
        {
            files: ['cypress/integration/**.spec.{js,ts,jsx,tsx}'],
            extends: ['plugin:cypress/recommended'],
            plugins: ['cypress'],
        },
        {
            files: ['*.md'],
            excludedFiles: ['LICENSE.md'],
            parser: 'eslint-plugin-markdownlint/parser',
            extends: ['plugin:markdownlint/recommended'],
            rules: {
                'markdownlint/md013': 'off',
                'markdownlint/md028': 'off',
            },
        },
    ],
}
