import { mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(viteConfig, {
    test: {
        setupFiles: ['setup-vitest.ts'],
    },
})
