import {
    addComponentsDir,
    addPlugin,
    createResolver,
    defineNuxtModule,
    installModule,
} from '@nuxt/kit'

import { name, version } from '../package.json'

// Module options TypeScript interface definition
export interface ModuleOptions {
    global?: boolean
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name,
        version,
        configKey: name,
    },
    // Default configuration options of the Nuxt module
    defaults: {
        global: false,
    },
    moduleDependencies: {
        '@nuxt/ui': {
            version: '>=4.4.0',
            optional: false,
        },
    },
    async setup(options, nuxt) {
        const resolver = createResolver(import.meta.url)

        await installModule('@nuxtjs/i18n')
        await installModule('@nuxt/ui')
        await installModule('@nuxt/icon')

        addPlugin(resolver.resolve('./runtime/plugin'))
        addComponentsDir({
            path: resolver.resolve('./runtime/components'),
            global: options.global,
        })

        if (!nuxt.options.modules.includes('@nuxt/ui')) {
            nuxt.options.modules.push('@nuxt/ui')
        }

        nuxt.options.css.push(resolver.resolve('./runtime/assets/css/tailwind.css'))
    },
})
