import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'

export default {
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    plugins: [
        dts({
            bundleTypes: true,
        }),
    ],
}
