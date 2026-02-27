// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import defaultConfig from '@swissgeo/config-eslint'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
    features: {
        // Rules for module authors
        tooling: true,
        // Rules for formatting
        stylistic: true,
        standalone: false,
    },
    dirs: {
        src: ['./playground'],
    },
}).append(Promise.resolve(defaultConfig))
