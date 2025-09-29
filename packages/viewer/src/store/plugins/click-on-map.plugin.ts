import type { PiniaPlugin } from 'pinia'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { ActionDispatcher } from '@/store/types'

import useDrawingStore from '@/store/modules/drawing.store'
import useFeaturesStore, { IdentifyMode } from '@/store/modules/features.store'
import useLayersStore from '@/store/modules/layers.store'
import useMapStore, { type ClickInfo, ClickType } from '@/store/modules/map.store'
import useUIStore, { FeatureInfoPositions } from '@/store/modules/ui.store'

const dispatcher: ActionDispatcher = { name: 'click-on-map.plugin' }

/**
 * Pinia plugins that will listen to click events and act depending on what's under the click (or
 * how long the mouse button was down)
 */
const clickOnMapManagementPlugin: PiniaPlugin = (): void => {
    const mapStore = useMapStore()
    const drawingStore = useDrawingStore()
    const featuresStore = useFeaturesStore()
    const layersStore = useLayersStore()
    const uiStore = useUIStore()

    drawingStore.$onAction(({ after, name, store }) => {
        after(() => {
            if (
                name === 'toggleDrawingOverlay' &&
                store.drawingOverlay.show &&
                mapStore.locationPopupCoordinates
            ) {
                // when entering the drawing menu, we need to clear the location popup
                mapStore.clearLocationPopupCoordinates(dispatcher)
            }
        })
    })

    mapStore.$onAction(({ name, store, args }) => {
        if (name === 'click' && !drawingStore.drawingOverlay.show) {
            // if a click occurs, we only take it into account (for identify and fullscreen toggle)
            // when the user is not currently drawing something on the map.
            const clickInfo: ClickInfo = args[0] as ClickInfo
            const isCtrlLeftSingleClick = clickInfo?.clickType === ClickType.CtrlLeftSingleClick
            const isContextMenuClick = clickInfo?.clickType === ClickType.ContextMenu
            const isIdentifyingFeature =
                clickInfo.clickType === ClickType.LeftSingleClick ||
                clickInfo.clickType === ClickType.CtrlLeftSingleClick ||
                clickInfo.clickType === ClickType.DrawBox

            if (isIdentifyingFeature) {
                const identifyMode = isCtrlLeftSingleClick ? IdentifyMode.Toggle : IdentifyMode.New

                if (clickInfo.features) {
                    featuresStore
                        .identifyFeatureAt(
                            {
                                layers: layersStore.visibleLayers.filter(
                                    (layer) => layer.hasTooltip
                                ),
                                vectorFeatures: clickInfo.features,
                                coordinate: clickInfo.coordinate,
                                identifyMode: identifyMode,
                            },
                            dispatcher
                        )
                        .then(() => {
                            if (
                                uiStore.noFeatureInfo &&
                                featuresStore.selectedFeaturesByLayerId.length > 0
                            ) {
                                // we only change the feature Info position when it's set to 'NONE', as
                                // we want to keep the user's choice of position between clicks.
                                uiStore.setFeatureInfoPosition(
                                    FeatureInfoPositions.DEFAULT,
                                    dispatcher
                                )
                            }
                        })
                        .catch((error) =>
                            log.error({
                                title: 'Click on map plugin',
                                titleColor: LogPreDefinedColor.Cyan,
                                messages: [
                                    'Error while identifying feature after a click on the map',
                                    args,
                                    error,
                                ],
                            })
                        )
                }
            }

            if (isContextMenuClick) {
                store.setLocationPopupCoordinates(clickInfo.coordinate, dispatcher)
            }
        }
    })
}

export default clickOnMapManagementPlugin
