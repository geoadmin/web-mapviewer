import { ENVIRONMENT } from '@/config'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'app-readiness-plugin' }

/**
 * Plugin that will listen to most mutation as long as a certain state of readiness is not reached.
 * When the state has loaded enough data / is ready, this plugin will trigger the mutation that will
 * set a flag to true and let the app know it can show the map and all linked functionalities.
 *
 * What is required for the app to be ready is :
 *
 * - Know the width and height of the viewport
 * - Have loaded the layers config
 * - Have loaded the topics config
 *
 * @param {Vuex.Store} store
 */
const appReadinessPlugin = (store) => {
    const unsubscribe = store.subscribe((mutation, state) => {
        // Log all mutations for debugging
        log.debug(
            `[store mutation]: type=${mutation.type} dispatcher=${mutation.payload?.dispatcher ?? null} payload=`,
            mutation.payload
        )

        // if app is not ready yet, we go through the checklist
        if (!state.app.isReady) {
            if (
                state.ui.width > 0 &&
                state.ui.height > 0 &&
                Object.keys(state.layers.config).length > 0 &&
                state.topics.config.length > 0
            ) {
                store.dispatch('setAppIsReady', dispatcher)

                // In production build we are not interested anymore in the mutation logs
                // therefore unsubscribe here
                if (ENVIRONMENT === 'production') {
                    unsubscribe()
                }
            }
        }
        // otherwise we ignore all mutations, our job is already done
    })

    // only subscribe to action logs for non productive build
    if (ENVIRONMENT !== 'production') {
        store.subscribeAction((action, _state) => {
            log.debug(
                `[store action]: type=${action.type} dispatcher=${action.payload?.dispatcher ?? null} payload=`,
                action.payload
            )
        })
    }
}

export default appReadinessPlugin
