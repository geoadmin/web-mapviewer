import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
    './vite.config.shared.js',
    './packages/numbers/vite.config.js',
    './packages/layers/vite.config.js',
    './packages/coordinates/vite.config.js',
    './packages/viewer/vite.config.mts',
    './packages/log/vite.config.js',
])
