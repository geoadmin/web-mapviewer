import type { Layer } from '@swissgeo/layers'

import type { ClickInfo, MapStore } from '@/store/modules/map/types/map'
import type { ActionDispatcher } from '@/store/types'

import useDrawingStore from '@/store/modules/drawing'
import useFeaturesStore from '@/store/modules/features'
import { IdentifyMode } from '@/store/modules/features/types/IdentifyMode.enum'
import useLayersStore from '@/store/modules/layers'
import { ClickType } from '@/store/modules/map/types/clickType.enum'
import useUIStore from '@/store/modules/ui'
import { FeatureInfoPositions } from '@/store/modules/ui/types/featureInfoPositions.enum'

export default function click(
    this: MapStore,
    clickInfo: ClickInfo | undefined,
    dispatcher: ActionDispatcher
): void {
    this.clickInfo = clickInfo

    const drawingStore = useDrawingStore()
    const featuresStore = useFeaturesStore()
    const layersStore = useLayersStore()
    const uiStore = useUIStore()

    if (clickInfo && !drawingStore.drawingOverlay.show) {
        // if a click occurs, we only take it into account (for identify and fullscreen toggle)
        // when the user is not currently drawing something on the map.
        const isCtrlLeftSingleClick = clickInfo.clickType === ClickType.CtrlLeftSingleClick
        const isContextMenuClick = clickInfo.clickType === ClickType.ContextMenu
        const isIdentifyingFeature =
            clickInfo.clickType === ClickType.LeftSingleClick ||
            clickInfo.clickType === ClickType.CtrlLeftSingleClick ||
            clickInfo.clickType === ClickType.DrawBox

        if (isIdentifyingFeature) {
            const identifyMode = isCtrlLeftSingleClick ? IdentifyMode.Toggle : IdentifyMode.New

            if (clickInfo.features) {
                featuresStore.identifyFeatureAt(
                    layersStore.visibleLayers.filter((layer: Layer) => layer.hasTooltip),
                    clickInfo.coordinate,
                    clickInfo.features,
                    identifyMode,
                    dispatcher
                )
                if (uiStore.noFeatureInfo && featuresStore.selectedFeaturesByLayerId.length > 0) {
                    // we only change the feature Info position when it's set to 'NONE', as
                    // we want to keep the user's choice of position between clicks.
                    uiStore.setFeatureInfoPosition(FeatureInfoPositions.Default, dispatcher)
                }
            }
        }

        if (isContextMenuClick) {
            if (Array.isArray(clickInfo.coordinate) && clickInfo.coordinate.length === 2) {
                this.locationPopupCoordinates = clickInfo.coordinate
            }
        }
    }
}
