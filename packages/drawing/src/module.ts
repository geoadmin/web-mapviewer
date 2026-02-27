import {
    addComponentsDir,
    addImportsDir,
    addPlugin,
    createResolver,
    defineNuxtModule,
    installModule,
} from '@nuxt/kit'
import { registerProj4 } from '@swissgeo/coordinates'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'

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
        '@pinia/nuxt': {
            version: '>=0.11.3',
            optional: false,
        },
        '@swissgeo/components': {
            version: '>=1.0.0',
            optional: false,
        },
    },
    async setup(options, nuxt) {
        const { resolve } = createResolver(import.meta.url)

        await installModule('@nuxtjs/i18n', {
            vueI18n: resolve('./i18n/i18n.config.ts'),
            langDir: resolve('./i18n/locales'),
            locales: [
                {
                    code: 'en',
                    file: resolve('./i18n/locales/en.json'),
                },
            ],
        })
        await installModule('@pinia/nuxt')
        await installModule('@nuxt/ui')
        await installModule('@nuxt/icon')
        await installModule('@swissgeo/components')

        addPlugin(resolve('./runtime/plugin'))
        addImportsDir(resolve('./runtime/utils'))
        addImportsDir(resolve('./runtime/stores'))
        addImportsDir(resolve('./runtime/composables'))
        addComponentsDir({
            path: resolve('./runtime/components'),
            global: options.global,
        })

        if (!nuxt.options.modules.includes('@nuxt/ui')) {
            nuxt.options.modules.push('@nuxt/ui')
        }
        if (!nuxt.options.modules.includes('@swissgeo/components')) {
            nuxt.options.modules.push('@swissgeo/components')
        }

        nuxt.options.css.push(resolve('./runtime/assets/css/tailwind.css'))

        registerProj4(proj4)
        register(proj4)
    },
})
