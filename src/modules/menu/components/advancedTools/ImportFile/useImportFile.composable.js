import { computed } from 'vue'
import { useStore } from 'vuex'

import { parseLayerFromFile } from '@/modules/menu/components/advancedTools/ImportFile/parser'
import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import UnknownProjectionError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/UnknownProjectionError.error'
import ErrorMessage from '@/utils/ErrorMessage.class'
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
            await store.dispatch('addLayer', {
                layer,
                zoomToLayerExtent: true,
                ...dispatcher,
            })
        } catch (error) {
            if (!sendErrorToStore) {
                throw error
            }
            let errorKey
            let errorParams
            log.error(`Error loading file`, source.name ?? source, error)
            if (error instanceof OutOfBoundsError) {
                errorKey = 'imported_file_out_of_bounds'
            } else if (error instanceof EmptyFileContentError) {
                errorKey = 'kml_gpx_file_empty'
            } else if (error instanceof UnknownProjectionError) {
                errorKey = 'unknown_projection_error'
                errorParams = {
                    epsg: error.epsg,
                }
            } else {
                errorKey = 'invalid_import_file_error'
                log.error(`Failed to load file`, error)
            }
            await store.dispatch('addErrors', {
                errors: [new ErrorMessage(errorKey, errorParams)],
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
