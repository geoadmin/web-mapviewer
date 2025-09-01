import { jsConfig } from '@swissgeo/eslint-config'

export default [
    ...jsConfig,
    {
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
]
