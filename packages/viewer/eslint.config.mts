import defaultConfig, { cypressConfig, vueConfig } from '@swissgeo/eslint-config'
import { configureVueProject, defineConfigWithVueTs } from '@vue/eslint-config-typescript'

configureVueProject({
    scriptLangs: ['ts', 'js'],
})

export default defineConfigWithVueTs(
    defaultConfig,
    vueConfig,
    cypressConfig('tests/cypress/')
)
