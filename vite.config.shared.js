import { fileURLToPath, URL } from 'url'
import dts from 'vite-plugin-dts'

export default {
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    plugins: [dts()],
}
