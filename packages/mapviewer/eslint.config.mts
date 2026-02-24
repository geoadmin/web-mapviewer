import defaultConfig, { cypressConfig } from '@swissgeo/config-eslint'

export default [
    ...defaultConfig,
    ...cypressConfig('tests/cypress/'),
    {
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
]
