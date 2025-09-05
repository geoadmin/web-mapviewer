import defaultConfig from '@swissgeo/eslint-config'

export default [
    ...defaultConfig,
    {
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
        },
    }
]
