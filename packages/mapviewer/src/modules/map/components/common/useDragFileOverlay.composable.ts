import type { MaybeRef } from 'vue'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { onBeforeUnmount, onMounted, toValue } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import useImportFile from '@/modules/menu/components/advancedTools/ImportFile/useImportFile.composable'
import useUiStore from '@/store/modules/ui'

const dispatcher: ActionDispatcher = {
    name: 'useDragFileOverlay.composable',
}

export default function useDragFileOverlay(mapHtmlElementRef: MaybeRef<HTMLElement | undefined>) {
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
                    handleFileSource(item.getAsFile()).catch((error) => {
                        log.error({
                            title: 'useDragFileOverlay.composable',
                            titleColor: LogPreDefinedColor.Red,
                            messages: ['Error while handling dropped file', error, dispatcher],
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
                        messages: ['Error while handling dropped file', error, dispatcher],
                    })
                })
            }
        }
    }

    function onDragLeave() {
        uiStore.setShowDragAndDropOverlay(false, dispatcher)
    }

    function registerDragAndDropEvent() {
        const mapHtmlElement = toValue(mapHtmlElementRef)

        if (!mapHtmlElement) {
            log.error({
                title: 'useDragFileOverlay.composable',
                messages: ['Cannot register drag and drop events: mapHtmlElement is undefined'],
            })
            return
        }

        log.debug({
            title: 'useDragFileOverlay.composable',
            titleColor: LogPreDefinedColor.Blue,
            messages: ['Register drag and drop events'],
        })
        mapHtmlElement.addEventListener('dragover', onDragOver)
        mapHtmlElement.addEventListener('drop', onDrop)
        mapHtmlElement.addEventListener('dragleave', onDragLeave)
    }

    function unregisterDragAndDropEvent() {
        const mapHtmlElement = toValue(mapHtmlElementRef)

        if (!mapHtmlElement) {
            return
        }

        log.debug({
            title: 'useDragFileOverlay.composable',
            titleColor: LogPreDefinedColor.Blue,
            messages: ['Unregister drag and drop events'],
        })
        mapHtmlElement.removeEventListener('dragover', onDragOver)
        mapHtmlElement.removeEventListener('drop', onDrop)
        mapHtmlElement.removeEventListener('dragleave', onDragLeave)
    }

    onMounted(registerDragAndDropEvent)
    onBeforeUnmount(unregisterDragAndDropEvent)

    // Immediate registration if element is already available
    if (toValue(mapHtmlElementRef)) {
        registerDragAndDropEvent()
    }
}
