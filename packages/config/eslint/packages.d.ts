import type { Linter } from 'eslint'

import { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

declare module 'eslint-plugin-chai-friendly' {
    const plugin: FlatConfig.Plugin
    export default plugin
}

declare module 'eslint-plugin-cypress/flat' {
    const plugin: {
        configs: {
            recommended: Linter.Config
            [key: string]: Linter.Config | undefined
        }
    }
    export default plugin
}
