import { ViteDevServer } from 'vite'

/** @see https://github.com/vitejs/vite/issues/8619#issuecomment-1579552753 */
export function pluginWatchNodeModules(modules) {
    // Merge module into pipe separated string for RegExp() below.
    const pattern = `/node_modules\\/(?!${modules.join('|')}).*/`
    return {
        name: 'watch-node-modules',
        configureServer: (server: ViteDevServer): void => {
            server.watcher.options = {
                ...server.watcher.options,
                ignored: [new RegExp(pattern), '**/.git/**'],
            }
        },
    }
}
