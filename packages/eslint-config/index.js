import jsESLint from '@eslint/js'
import markdown from '@eslint/markdown'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginChaiFriendly from 'eslint-plugin-chai-friendly'
import pluginCypress from 'eslint-plugin-cypress'
import mocha from 'eslint-plugin-mocha'
import perfectionist from 'eslint-plugin-perfectionist'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tsESLint, { plugin as tsESLintPlugin } from 'typescript-eslint'

const noUnusedVarsRules = {
    'no-unused-vars': [
        'error',
        {
            argsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
        },
    ],
    '@typescript-eslint/no-unused-vars': [
        'error',
        {
            argsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
        },
    ],
}

const chaiFriendlyRules = {
    plugins: {
        'chai-friendly': pluginChaiFriendly,
    },
    rules: {
        'no-console': 'off',
        'no-prototype-builtins': 'off',
        // see https://github.com/ihordiachenko/eslint-plugin-chai-friendly?tab=readme-ov-file#usage
        'no-unused-expressions': 'off', // disable original rule for JS
        '@typescript-eslint/no-unused-expressions': 'off', // disable original rule for TS
        'chai-friendly/no-unused-expressions': 'error',
        ...noUnusedVarsRules,
    },
}

/**
 * Generates a set of ESLint rules for Cypress tests. The root directory of the Cypress tests can be
 * specified (the default value is 'tests/cypress/').
 */
export function cypressConfig(cypressRootDir = 'tests/cypress/') {
    return tsESLint.config(pluginCypress.configs.recommended, {
        files: [`${cypressRootDir}**/*.js`, `${cypressRootDir}**/*.cy.ts`],
        ...chaiFriendlyRules,
    })
}

export const vueConfig = tsESLint.config(
    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommendedTypeCheckedOnly,
    {
        files: ['**/*.vue'],
        plugins: {
            '@typescript-eslint': tsESLintPlugin,
        },
        rules: {
            'vue/html-indent': ['error', 4],
            ...noUnusedVarsRules,
        },
    }
)

export const unitTestsConfig = [
    {
        files: ['**/*.spec.{js,ts}', 'scripts/**.{js,ts}'],
        ...chaiFriendlyRules,
    },
]

export const markdownConfig = [
    {
        files: ['**/*.md'],
        plugins: {
            markdown: markdown,
        },
        processor: 'markdown/markdown',
        rules: {
            'no-irregular-whitespace': 'off',
            'no-undef': 'off',
        },
    },
]

export const jsConfig = [
    jsESLint.configs.recommended,
    {
        ignores: [
            '.gitignore',
            '**/*.md',
            '**/node_modules',
            '**/.github',
            '**/dist',
            'tsconfig.json',
        ],
    },
    {
        files: ['**/*.js', '**/*.jsx'],
        plugins: {
            mocha,
            'chai-friendly': pluginChaiFriendly,
            perfectionist,
            '@typescript-eslint': tsESLintPlugin,
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

            sourceType: 'module',
        },
        rules: {
            eqeqeq: ['error', 'always'],
            'mocha/no-exclusive-tests': 'error',
            'no-console': 'error',
            'no-var': 'error',
            'perfectionist/sort-imports': [
                'error',
                { type: 'alphabetical', internalPattern: ['^@/.*'] },
            ],
            ...noUnusedVarsRules,
        },
    },
    ...markdownConfig,
    ...unitTestsConfig,
    // skip the formatting in the linting process
    skipFormatting,
]

const defaultConfig = tsESLint.config(
    jsConfig,
    tsESLint.configs.recommended,
    ...markdownConfig,
    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['**/*.md'],
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
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
    // we have to declare that AFTER the TS specifics, our unit test rules from the JS config are otherwise ignored (when the tests are written in TS)
    unitTestsConfig
)

export default defaultConfig
