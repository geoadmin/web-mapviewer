import { onBeforeUnmount, onMounted } from 'vue'
import { useStore } from 'vuex'

import useImportFile from '@/modules/menu/components/advancedTools/ImportFile/useImportFile.composable'
import log from '@/utils/logging'

const dispatcher = {
    dispatcher: 'useDragFileOverlay.composable',
}

/**
 * Adds file drag&drop capabilities to the map element. Can be used for both OL and Cesium (no
 * framework-specific code here).
 *
 * @param {Element} mapHtmlElement
 */
export default function useDragFileOverlay(mapHtmlElement) {
    const { handleFileSource } = useImportFile()
    const store = useStore()

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
            for (/** @type {DataTransferItem} */ const item of event.dataTransfer.items) {
                // If dropped items aren't files, reject them
                if (item.kind === 'file') {
                    handleFileSource(item.getAsFile())
                }
            }
        } else {
            for (/** @type {File} */ const file of event.dataTransfer.files) {
                handleFileSource(file)
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
        log.debug('[useDragFileOverlay] Register drag and drop events')
        mapHtmlElement.addEventListener('dragover', onDragOver)
        mapHtmlElement.addEventListener('drop', onDrop)
        mapHtmlElement.addEventListener('dragleave', onDragLeave)
    }

    function unregisterDragAndDropEvent() {
        log.debug('[useDragFileOverlay] Unregister drag and drop events')
        mapHtmlElement.removeEventListener('dragover', onDragOver)
        mapHtmlElement.removeEventListener('drop', onDrop)
        mapHtmlElement.removeEventListener('dragleave', onDragLeave)
    }

    onMounted(registerDragAndDropEvent)
    onBeforeUnmount(unregisterDragAndDropEvent)

    if (mapHtmlElement) {
        registerDragAndDropEvent()
    }
}
