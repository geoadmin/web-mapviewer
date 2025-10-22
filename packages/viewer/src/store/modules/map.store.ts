import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'

import { defineStore } from 'pinia'

import type { SelectableFeature } from '@/api/features.api'
import type { ActionDispatcher } from '@/store/types'

import { MapStoreActions } from '@/store/actions'
import useDrawingStore from '@/store/modules/drawing'
import useFeaturesStore from '@/store/modules/features'
import { IdentifyMode } from '@/store/modules/features/types/IdentifyMode.enum'
import useLayersStore from '@/store/modules/layers.store'
import useUIStore, { FeatureInfoPositions } from '@/store/modules/ui.store'

export enum ClickType {
    /* Any action that triggers the context menu, so for example, right click with a mouse or
    a long click with the finger on a touch device.*/
    ContextMenu = 'ContextMenu',
    /* A single click, with the left mouse button or with the finger on a touch device */
    LeftSingleClick = 'LEFT_SINGLECLICK',
    /* A single click with the CTRL button pressed */
    CtrlLeftSingleClick = 'CTRL_LEFT_SINGLECLICK',
    /* Drawing a box with ctrl and dragging a left click */
    DrawBox = 'DRAW_BOX',
}

export interface ClickInfo {
    coordinate: SingleCoordinate
    pixelCoordinate?: SingleCoordinate
    features?: SelectableFeature<false>[] // LayerFeatures are not editable
    clickType?: ClickType
}

/**
 * Module that describes specific interactions with the map (dragging, clicking). It also serves as
 * a way to tell the map where to highlight stuff or place a pin (to keep the rest of the app
 * ignorant of the mapping framework)
 */
export interface MapState {
    /** Information about the last click that has occurred on the map */
    clickInfo: ClickInfo | undefined
    /** Coordinate of the dropped pin on the map. If null, no pin will be shown. */
    pinnedLocation: SingleCoordinate | undefined
    /**
     * Will be used to show the location of search entries when they are hovered. If we use the same
     * pinned location as the one above, the pinned location is lost as soon as another one is
     * hovered. Meaning that the search bar is still filled with a search query, but no pinned
     * location is present anymore.
     */
    previewedPinnedLocation: SingleCoordinate | undefined
    /** Coordinate of the locationPop on the map. If null, locationPopup will not be shown. */
    locationPopupCoordinates: SingleCoordinate | undefined
    /** Tells if the map is in print mode, meaning it will jump to a higher zoom level early. */
    printMode: boolean
    rectangleSelectionExtent: FlatExtent | undefined
}

const useMapStore = defineStore('map', {
    state: (): MapState => ({
        clickInfo: undefined,
        pinnedLocation: undefined,
        previewedPinnedLocation: undefined,
        locationPopupCoordinates: undefined,
        printMode: false,
        rectangleSelectionExtent: undefined,
    }),
    actions: {
        /** Sets all information about the last click that occurred on the map* */
        [MapStoreActions.Click](clickInfo: ClickInfo | undefined, dispatcher: ActionDispatcher) {
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
                    const identifyMode = isCtrlLeftSingleClick
                        ? IdentifyMode.Toggle
                        : IdentifyMode.New

                    if (clickInfo.features) {
                        featuresStore.identifyFeatureAt(
                            layersStore.visibleLayers.filter((layer) => layer.hasTooltip),
                            clickInfo.coordinate,
                            clickInfo.features,
                            identifyMode,
                            dispatcher
                        )
                        if (
                            uiStore.noFeatureInfo &&
                            featuresStore.selectedFeaturesByLayerId.length > 0
                        ) {
                            // we only change the feature Info position when it's set to 'NONE', as
                            // we want to keep the user's choice of position between clicks.
                            uiStore.setFeatureInfoPosition(FeatureInfoPositions.DEFAULT, dispatcher)
                        }
                    }
                }

                if (isContextMenuClick) {
                    this.setLocationPopupCoordinates(clickInfo.coordinate, dispatcher)
                }
            }
        },

        [MapStoreActions.ClearClick](dispatcher: ActionDispatcher) {
            this.clickInfo = undefined
        },

        /** Sets the dropped pin on the map. If coordinates are undefined, the dropped pin is removed */
        [MapStoreActions.SetPinnedLocation](
            coordinates: SingleCoordinate | undefined,
            dispatcher: ActionDispatcher
        ) {
            if (Array.isArray(coordinates) && coordinates.length === 2) {
                this.pinnedLocation = coordinates
            } else {
                this.pinnedLocation = undefined
            }
        },

        [MapStoreActions.SetPreviewedPinnedLocation](
            coordinates: SingleCoordinate | undefined,
            dispatcher: ActionDispatcher
        ) {
            if (Array.isArray(coordinates) && coordinates.length === 2) {
                this.previewedPinnedLocation = coordinates
            } else {
                this.previewedPinnedLocation = undefined
            }
        },

        [MapStoreActions.ClearPreviewPinnedLocation](dispatcher: ActionDispatcher) {
            this.previewedPinnedLocation = undefined
        },

        [MapStoreActions.ClearLocationPopupCoordinates](dispatcher: ActionDispatcher) {
            this.locationPopupCoordinates = undefined
        },

        /**
         * Sets the locationPopup on the map. Ff coordinates are undefined, the locationPopup is
         * removed
         */
        [MapStoreActions.SetLocationPopupCoordinates](
            coordinates: SingleCoordinate | undefined,
            dispatcher: ActionDispatcher
        ) {
            if (Array.isArray(coordinates) && coordinates.length === 2) {
                this.locationPopupCoordinates = coordinates
            } else {
                this.locationPopupCoordinates = undefined
            }
        },

        /**
         * Sets the map in (or out of) print mode.
         *
         * Print mode was added for the new headless print service to test out some
         * OpenLayers-specific setup when printing.
         */
        [MapStoreActions.SetPrintMode](isActive: boolean, dispatcher: ActionDispatcher) {
            this.printMode = isActive
        },

        [MapStoreActions.SetRectangleSelectionExtent](
            extent: FlatExtent | undefined,
            dispatcher: ActionDispatcher
        ) {
            if (Array.isArray(extent) && extent.length === 4) {
                this.rectangleSelectionExtent = extent
            } else {
                this.rectangleSelectionExtent = undefined
            }
        },
    },
})

export default useMapStore
