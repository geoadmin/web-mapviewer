import defaultConfig from '@swissgeo/config-eslint'

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
