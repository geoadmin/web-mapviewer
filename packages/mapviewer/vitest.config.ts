import { mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
    viteConfig({
        mode: 'test',
        command: 'build',
    }),
    {
        test: {
            include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
            outputFile: 'tests/results/unit/unit-test-report.xml',
            silent: 'passed-only',
            setupFiles: ['tests/setup-vitest.ts'],
            environment: 'jsdom',
        },
    }
)
