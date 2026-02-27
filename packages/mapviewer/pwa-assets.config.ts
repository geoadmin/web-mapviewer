import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

// will generate icons for the PWA definition (the manifest.json) from a unique SVG file
export default defineConfig({
    preset,
    images: ['public/icon.svg'],
})
