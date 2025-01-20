import log from '@geoadmin/log'
import { computed } from 'vue'
import { useStore } from 'vuex'

import { parseLayerFromFile } from '@/modules/menu/components/advancedTools/ImportFile/parser'
import generateErrorMessageFromErrorType from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/generateErrorMessageFromErrorType.utils'
import WarningMessage from '@/utils/WarningMessage.class'

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
     * @param {Boolean} [sendWarningToStore=true] If true, will dispatch any warning to the store,
     *   if false, it will ignore it. Default is `true`
     * @returns {Promise<void>}
     */
    async function handleFileSource(source, sendErrorToStore = true, sendWarningToStore = true) {
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
                const extent =
                    layer.extent.length === 4
                        ? layer.extent
                        : [...layer.extent[0], ...layer.extent[1]]
                const lastImportedLayerIsPartiallyOutOfBounds =
                    projection.value.bounds.lowerX > extent[0] ||
                    projection.value.bounds.lowerX > extent[2] ||
                    projection.value.bounds.upperX < extent[0] ||
                    projection.value.bounds.upperX < extent[2] ||
                    projection.value.bounds.lowerY > extent[1] ||
                    projection.value.bounds.lowerY > extent[3] ||
                    projection.value.bounds.upperY < extent[1] ||
                    projection.value.bounds.upperY < extent[3]
                if (lastImportedLayerIsPartiallyOutOfBounds) {
                    layer.hasWarning = true
                    layer.addWarningMessage(
                        new WarningMessage('file_imported_partially_out_of_bounds', {
                            filename: layer.name ?? layer.id,
                        })
                    )
                }

                await store.dispatch('addLayer', {
                    layer,
                    zoomToLayerExtent: true,
                    ...dispatcher,
                })

                if (sendWarningToStore && layer.hasWarning) {
                    store.dispatch('addWarnings', {
                        warnings: Array.from(layer.warningMessages),
                        ...dispatcher,
                    })
                }
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
