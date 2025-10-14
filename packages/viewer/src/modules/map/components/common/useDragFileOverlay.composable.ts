import log, { LogPreDefinedColor } from '@swissgeo/log'
import { onBeforeUnmount, onMounted } from 'vue'

import useImportFile from '@/modules/menu/components/advancedTools/ImportFile/useImportFile.composable'
import useUiStore from '@/store/modules/ui.store'

const dispatcher = {
    name: 'useDragFileOverlay.composable',
}

export default function useDragFileOverlay(mapHtmlElement: HTMLElement) {
    const { handleFileSource } = useImportFile()
    const uiStore = useUiStore()

    function onDragOver(event: DragEvent) {
        event.preventDefault()
        uiStore.setShowDragAndDropOverlay(true, dispatcher)
    }

    function onDrop(event: DragEvent) {
        event.preventDefault()
        uiStore.setShowDragAndDropOverlay(false, dispatcher)

        if (event.dataTransfer?.items) {
            for (const item of event.dataTransfer.items) {
                if (item.kind === 'file') {
                    handleFileSource(item.getAsFile()!).catch((error) => {
                        log.error({
                            title: 'useDragFileOverlay.composable',
                            titleColor: LogPreDefinedColor.Red,
                            message: ['Error while handling dropped file', error, dispatcher],
                        })
                    })
                }
            }
        } else if (event.dataTransfer?.files) {
            for (const file of event.dataTransfer.files) {
                handleFileSource(file).catch((error) => {
                    log.error({
                        title: 'useDragFileOverlay.composable',
                        titleColor: LogPreDefinedColor.Red,
                        message: ['Error while handling dropped file', error, dispatcher],
                    })
                })
            }
        }
    }

    function onDragLeave() {
        uiStore.setShowDragAndDropOverlay(false, dispatcher)
    }

    function registerDragAndDropEvent() {
        log.debug({
            title: 'useDragFileOverlay.composable',
            titleColor: LogPreDefinedColor.Blue,
            message: ['Register drag and drop events'],
        })
        mapHtmlElement.addEventListener('dragover', onDragOver)
        mapHtmlElement.addEventListener('drop', onDrop)
        mapHtmlElement.addEventListener('dragleave', onDragLeave)
    }

    function unregisterDragAndDropEvent() {
        log.debug({
            title: 'useDragFileOverlay.composable',
            titleColor: LogPreDefinedColor.Blue,
            message: ['Unregister drag and drop events'],
        })
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