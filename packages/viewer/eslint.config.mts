import defaultConfig, { cypressConfig } from '@swissgeo/eslint-config'

export default [
    ...defaultConfig,
    ...cypressConfig('tests/cypress/'),
    {
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
        },
    }
]
