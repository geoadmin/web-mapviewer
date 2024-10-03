import { onBeforeUnmount, onMounted } from 'vue'
import { useStore } from 'vuex'

import { handleFileContent } from '@/modules/menu/components/advancedTools/ImportFile/utils'
import { OutOfBoundsError } from '@/utils/coordinates/coordinateUtils'
import ErrorMessage from '@/utils/ErrorMessage.class'
import { EmptyGPXError } from '@/utils/gpxUtils'
import { EmptyKMLError } from '@/utils/kmlUtils'
import log from '@/utils/logging'

const dispatcher = {
    dispatcher: 'useDragFileOverlay.composable',
}

/**
 * @param {File} file
 * @returns {Promise<ArrayBuffer>}
 */
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target.result)
        reader.onerror = (error) => reject(error)
        // The file might be a KMZ file, which is a zip archive. Reading zip archive as text
        // is asking for trouble therefore we use ArrayBuffer
        reader.readAsArrayBuffer(file)
    })
}

export default function useDragFileOverlay(htmlElement) {
    const store = useStore()

    /**
     * @param {File} file
     * @returns {Promise<void>}
     */
    async function handleFile(file) {
        try {
            const fileContent = await readFileContent(file)
            await handleFileContent(store, fileContent, file.name, file)
        } catch (error) {
            let errorKey
            log.error(`Error loading file`, file.name, error)
            if (error instanceof OutOfBoundsError) {
                errorKey = 'imported_file_out_of_bounds'
            } else if (error instanceof EmptyKMLError || error instanceof EmptyGPXError) {
                errorKey = 'kml_gpx_file_empty'
            } else {
                errorKey = 'invalid_import_file_error'
                log.error(`Failed to load file`, error)
            }
            store.dispatch('addErrors', { error: new ErrorMessage(errorKey, null), ...dispatcher })
        }
    }

    function onDragOver(event) {
        event.preventDefault()
        store.dispatch('setShowDragAndDropOverlay', { showDragAndDropOverlay: true, ...dispatcher })
    }

    function onDrop(event) {
        event.preventDefault()
        store.dispatch('setShowDragAndDropOverlay', {
            showDragAndDropOverlay: false,
            ...dispatcher,
        })

        if (event.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i = 0; i < event.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                if (event.dataTransfer.items[i].kind === 'file') {
                    const file = event.dataTransfer.items[i].getAsFile()
                    handleFile(file)
                }
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            for (let i = 0; i < event.dataTransfer.files.length; i++) {
                const file = event.dataTransfer.files[i]
                handleFile(file)
            }
        }
    }

    function onDragLeave() {
        store.dispatch('setShowDragAndDropOverlay', {
            showDragAndDropOverlay: false,
            ...dispatcher,
        })
    }

    function registerDragAndDropEvent() {
        log.debug(`Register drag and drop events`)
        htmlElement.addEventListener('dragover', onDragOver)
        htmlElement.addEventListener('drop', onDrop)
        htmlElement.addEventListener('dragleave', onDragLeave)
    }

    function unregisterDragAndDropEvent() {
        log.debug(`Unregister drag and drop events`)
        htmlElement.removeEventListener('dragover', onDragOver)
        htmlElement.removeEventListener('drop', onDrop)
        htmlElement.removeEventListener('dragleave', onDragLeave)
    }

    onMounted(registerDragAndDropEvent)
    onBeforeUnmount(unregisterDragAndDropEvent)
}
