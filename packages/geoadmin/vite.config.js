import { resolve } from 'path'
import { fileURLToPath, URL } from 'url'
import dts from 'vite-plugin-dts'

export default {
    build: {
        lib: {
            entry: [
                resolve(__dirname, 'src/index.ts'),
                resolve(__dirname, 'src/log.ts'),
                resolve(__dirname, 'src/proj/proj.ts'),
                resolve(__dirname, 'src/utils/numbers.ts'),
                resolve(__dirname, 'src/utils/coordinates.ts'),
            ],
            name: 'geoadmin',
            fileName: (format, name) => {
                if (format === 'es') {
                    return `${name}.js`
                }
                return `${name}.${format}`
            },
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    plugins: [dts()],
}
