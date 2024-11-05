import { computed } from 'vue'
import { useStore } from 'vuex'

import { parseLayerFromFile } from '@/modules/menu/components/advancedTools/ImportFile/parser'
import generateErrorMessageFromErrorType from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/generateErrorMessageFromErrorType.utils'
import log from '@/utils/logging'

const dispatcher = {
    dispatcher: 'useImportFile.composable',
}

/** Standardized way of dealing with the import of external files (local or through URL) in our app. */
export default function useImportFile() {
    const store = useStore()
    const projection = computed(() => store.state.position.projection)

    /**
     * @param {File | String} source
     * @param {Boolean} [sendErrorToStore=true] If true, will dispatch any error to the store, if
     *   false will throw any error at you. Default is `true`
     * @returns {Promise<void>}
     */
    async function handleFileSource(source, sendErrorToStore = true) {
        if (!source) {
            return
        }
        await store.dispatch('setLoadingBarRequester', {
            requester: source.name ?? source,
            ...dispatcher,
        })
        try {
            const layer = await parseLayerFromFile(source, projection.value)
            // checking that the same layer is not already present before adding it
            if (store.getters.getActiveLayersById(layer.id).length === 0) {
                await store.dispatch('addLayer', {
                    layer,
                    zoomToLayerExtent: true,
                    ...dispatcher,
                })
            }
        } catch (error) {
            if (!sendErrorToStore) {
                throw error
            }
            log.error(`Error loading file`, source.name ?? source, error)
            await store.dispatch('addErrors', {
                errors: [generateErrorMessageFromErrorType(error)],
                ...dispatcher,
            })
        } finally {
            await store.dispatch('clearLoadingBarRequester', {
                requester: source.name ?? source,
                ...dispatcher,
            })
        }
    }

    return {
        handleFileSource,
    }
}
