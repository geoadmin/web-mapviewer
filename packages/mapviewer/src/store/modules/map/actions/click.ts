import type { FlatExtent } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'

import log from '@swissgeo/log'

import type { IdentifyMode } from '@/store/modules/features/types'
import type { ClickInfo, MapStore } from '@/store/modules/map/types'
import type { ActionDispatcher } from '@/store/types'

import useDrawingStore from '@/store/modules/drawing'
import useFeaturesStore from '@/store/modules/features'
import useLayersStore from '@/store/modules/layers'
import useUIStore from '@/store/modules/ui'

export default function click(
    this: MapStore,
    clickInfo: ClickInfo | undefined,
    dispatcher: ActionDispatcher
): void {
    this.clickInfo = clickInfo
    if (!clickInfo) {
        log.debug({
            title: 'Map store / click',
            messages: ['Click info is undefined, nothing to process.'],
        })
        return
    }
    const drawingStore = useDrawingStore()
    const featuresStore = useFeaturesStore()
    const layersStore = useLayersStore()
    const uiStore = useUIStore()
    if (clickInfo.clickType === 'DRAW_BOX') {
        // If the click is a box selection, we set the rectangle selection extent to the
        // coordinates of the click.
        this.setRectangleSelectionExtent(clickInfo.coordinate as FlatExtent, dispatcher)
    } else if (
        clickInfo.clickType === 'CTRL_LEFT_SINGLE_CLICK' ||
        clickInfo.clickType === 'CONTEXT_MENU'
    ) {
        // If the click is a ctrl left single click or a right click, we keep the rectangle selection extent
    } else {
        // For any other click type, we clear the rectangle selection extent
        this.setRectangleSelectionExtent(undefined, dispatcher)
    }

    if (!drawingStore.overlay.show) {
        // if a click occurs, we only take it into account (for identify and fullscreen toggle)
        // when the user is not currently drawing something on the map.
        const isCtrlLeftSingleClick = clickInfo.clickType === 'CTRL_LEFT_SINGLE_CLICK'
        const isContextMenuClick = clickInfo.clickType === 'CONTEXT_MENU'
        const isIdentifyingFeature =
            clickInfo.clickType === 'LEFT_SINGLE_CLICK' ||
            clickInfo.clickType === 'CTRL_LEFT_SINGLE_CLICK' ||
            clickInfo.clickType === 'DRAW_BOX'

        if (isIdentifyingFeature) {
            const identifyMode: IdentifyMode = isCtrlLeftSingleClick ? 'TOGGLE' : 'NEW'

            featuresStore
                .identifyFeatureAt(
                    layersStore.visibleLayers.filter((layer: Layer) => layer.hasTooltip),
                    clickInfo.coordinate,
                    clickInfo.features ?? [],
                    identifyMode,
                    dispatcher
                )
                .then(() => {
                    if (
                        uiStore.noFeatureInfo &&
                        featuresStore.selectedFeaturesByLayerId.length > 0
                    ) {
                        // we only change the feature Info position when it's set to 'NONE', as
                        // we want to keep the user's choice of position between clicks.
                        uiStore.setFeatureInfoPosition('default', dispatcher)
                    }
                })
                .catch((error) => {
                    log.error({
                        title: 'Map store / click',
                        messages: ['Error during feature identification', error],
                    })
                })
        }

        if (isContextMenuClick) {
            if (Array.isArray(clickInfo.coordinate) && clickInfo.coordinate.length === 2) {
                this.locationPopupCoordinates = clickInfo.coordinate
            }
        }
    }
}
