import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
    './vite.config.shared.js',
    './packages/geoadmin-numbers/vite.config.js',
    './packages/geoadmin-layers/vite.config.js',
    './packages/geoadmin-coordinates/vite.config.js',
    './packages/mapviewer/vite.config.mts',
    './packages/geoadmin-log/vite.config.js',
])
