import { extentUtils } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import { WarningMessage } from '@swissgeo/log/Message'
import { computed } from 'vue'

import { parseLayerFromFile } from '@/modules/menu/components/advancedTools/ImportFile/parser'
import generateErrorMessageFromErrorType from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/generateErrorMessageFromErrorType.utils'
import useLayersStore from '@/store/modules/layers.store'
import usePositionStore from '@/store/modules/position.store'
import useUIStore from '@/store/modules/ui'

const dispatcher = {
    name: 'useImportFile.composable',
}

/** Standardized way of dealing with the import of external files (local or through URL) in our app. */
export default function useImportFile() {
    const layersStore = useLayersStore()
    const uiStore = useUIStore()
    const positionStore = usePositionStore()

    const projection = computed(() => positionStore.projection)

    /**
     * @param {File | String} source
     * @param {Boolean} [sendErrorToStore=true] If true, will dispatch any error to the store, if
     *   false will throw any error at you. Default is `true`
     * @param {Boolean} [sendWarningToStore=true] If true, will dispatch any warning to the store,
     *   if false, it will ignore it. Default is `true`
     * @returns {Promise<void>}
     */
    async function handleFileSource(
        source: string | File,
        sendErrorToStore = true,
        sendWarningToStore = true
    ) {
        if (!source) {
            return
        }

        uiStore.setLoadingBarRequester((source as File).name ?? source, dispatcher)

        try {
            const layer = await parseLayerFromFile(source, projection.value)

            // checking that the same layer is not already present before adding it
            if (layersStore.getActiveLayersById(layer.id).length === 0 && layer.extent) {
                const extent = extentUtils.flattenExtent(layer.extent)

                if (projection.value.bounds) {
                    const isLayerFullyInBound =
                        projection.value.bounds.isInBounds(extent[0], extent[1]) &&
                        projection.value.bounds.isInBounds(extent[2], extent[3])
                    if (!isLayerFullyInBound) {
                        layer.warningMessages = (layer.warningMessages ?? []).concat([
                            new WarningMessage(
                                'file_imported_partially_out_of_bounds',
                                { filename: layer.name ?? layer.id }
                            ),
                        ])
                        layer.hasWarning = true
                    }
                }

                layersStore.addLayer(
                    {
                        layer,
                        zoomToLayerExtent: true,
                    },
                    dispatcher
                )

                if (sendWarningToStore && layer.hasWarning) {
                    uiStore.addWarnings(Array.from(layer.warningMessages ?? []), dispatcher)
                }
            }
        } catch (error: unknown) {
            if (!sendErrorToStore) {
                throw error
            }
            log.error({
                title: 'useImportFile.composable',
                messages: [`Error loading file`, (source as File).name ?? source, error],
            })
            if (error instanceof Error) {
                uiStore.addErrors([generateErrorMessageFromErrorType(error)], dispatcher)
            }
        } finally {
            uiStore.clearLoadingBarRequester((source as File).name ?? source, dispatcher)
        }
    }

    return {
        handleFileSource,
    }
}
