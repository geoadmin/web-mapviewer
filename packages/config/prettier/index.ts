import type { Config } from 'prettier'

const defaultConfig: Config = {
    printWidth: 100,
    singleQuote: true,
    singleAttributePerLine: true,
    semi: false,
    trailingComma: 'es5',
    tabWidth: 4,
    jsxSingleQuote: false,
    overrides: [
        {
            files: '*.md',
            options: {
                tabWidth: 2,
            },
        },
    ],
}

type AvailablePlugins =
    | '@prettier/plugin-xml'
    | 'prettier-plugin-jsdoc'
    | 'prettier-plugin-packagejson'
    | 'prettier-plugin-tailwindcss'

/**
 * Define the prettier config, given the plugins to use
 *
 * @param plugins A list of plugins to use. If you provide a plugin here, you need to have it
 *   installed in your project (through your package.json file)
 */

function defineConfig(...plugins: AvailablePlugins[]): Config {
    const config = { ...defaultConfig }
    if (plugins) {
        config.plugins = plugins
    }
    return config
}

export default defineConfig
