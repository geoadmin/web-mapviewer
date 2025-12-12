import type { Linter } from 'eslint'

declare module 'eslint-plugin-cypress/lib' {
    const plugin: {
        configs: {
            recommended: Linter.Config
            [key: string]: Linter.Config | undefined
        }
    }
    export default plugin
}
