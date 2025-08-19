import js from '@eslint/js'
import markdown from '@eslint/markdown'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import {
    configureVueProject,
    defineConfigWithVueTs,
    vueTsConfigs,
} from '@vue/eslint-config-typescript'
import pluginCypress from 'eslint-plugin-cypress/flat'
import mocha from 'eslint-plugin-mocha'
import perfectionist from 'eslint-plugin-perfectionist'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

configureVueProject({
    scriptLangs: ['ts', 'js'],
})

export default defineConfigWithVueTs(
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    pluginCypress.configs.recommended,
    vueTsConfigs.recommendedTypeCheckedOnly,
    {
        ignores: ['.gitignore', '**/node_modules', '**/.github', '**/dist', '**/*.md'],
    },
    {
        plugins: {
            mocha,
            perfectionist,
        },

        languageOptions: {
            ecmaVersion: 'latest',

            globals: {
                ...globals.browser,
                ...globals.vitest,
                ...globals.node,
                defineModel: 'readonly',
                __APP_VERSION__: true,
                __VITE_ENVIRONMENT__: true,
                __CESIUM_STATIC_PATH__: true,
                __IS_TESTING_WITH_CYPRESS__: true,
            },

            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },

            sourceType: 'module',
        },

        rules: {
            eqeqeq: ['error', 'always'],
            'mocha/no-exclusive-tests': 'error',
            'no-console': 'error',
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                },
            ],
            'no-var': 'error',
            'perfectionist/sort-imports': [
                'error',
                { type: 'alphabetical', internalPattern: ['^@/.*'] },
            ],
            'vue/html-indent': ['error', 4],
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        // switching to TypeScript unused var rule (instead of JS rule), so that no error is raised
        // on unused param from abstract function arguments
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    // as we are adding dispatcher reference in all our store action, but won't be using
                    // them directly in the action, we must ignore these unused variables too
                    argsIgnorePattern: '^(_|dispatcher)',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/consistent-type-exports': 'error',
            '@typescript-eslint/no-import-type-side-effects': 'error',
        },
    },
    {
        files: ['tests/**/*.{js,ts,jsx,tsx}', 'src/**/__test__/**/*.spec.js', 'scripts/**'],
        rules: {
            'no-console': 'off',
            'no-prototype-builtins': 'off',
        },
    },
    {
        files: ['**/*.md'],
        ignores: ['!**/*.md', '**/LICENSE.md'],
        plugins: {
            markdown: markdown,
        },
        processor: 'markdown/markdown',
        rules: {
            'no-irregular-whitespace': 'off',
        },
    },
    // skip the formatting in the linting process
    skipFormatting
)
