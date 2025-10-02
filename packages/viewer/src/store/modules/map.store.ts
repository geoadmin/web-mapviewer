import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'

import { defineStore } from 'pinia'

import type {SelectableFeature } from '@/api/features.api'
import type { ActionDispatcher } from '@/store/types'

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
    features?: SelectableFeature<true>[] // TODO unsure if it's editable
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
        click(clickInfo: ClickInfo | undefined, dispatcher: ActionDispatcher) {
            this.clickInfo = clickInfo
        },

        clearClick(dispatcher: ActionDispatcher) {
            this.clickInfo = undefined
        },

        /** Sets the dropped pin on the map. If coordinates are undefined, the dropped pin is removed */
        setPinnedLocation(coordinates: SingleCoordinate | undefined, dispatcher: ActionDispatcher) {
            if (Array.isArray(coordinates) && coordinates.length === 2) {
                this.pinnedLocation = coordinates
            } else {
                this.pinnedLocation = undefined
            }
        },

        setPreviewedPinnedLocation(
            coordinates: SingleCoordinate | undefined,
            dispatcher: ActionDispatcher
        ) {
            if (Array.isArray(coordinates) && coordinates.length === 2) {
                this.previewedPinnedLocation = coordinates
            } else {
                this.previewedPinnedLocation = undefined
            }
        },

        clearPreviewPinnedLocation(dispatcher: ActionDispatcher) {
            this.previewedPinnedLocation = undefined
        },

        clearLocationPopupCoordinates(dispatcher: ActionDispatcher) {
            this.locationPopupCoordinates = undefined
        },

        /**
         * Sets the locationPopup on the map. Ff coordinates are undefined, the locationPopup is
         * removed
         */
        setLocationPopupCoordinates(
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
        setPrintMode(isActive: boolean, dispatcher: ActionDispatcher) {
            this.printMode = isActive
        },

        setRectangleSelectionExtent(extent: FlatExtent | undefined, dispatcher: ActionDispatcher) {
            if (Array.isArray(extent) && extent.length === 4) {
                this.rectangleSelectionExtent = extent
            } else {
                this.rectangleSelectionExtent = undefined
            }
        },
    },
})

export default useMapStore
