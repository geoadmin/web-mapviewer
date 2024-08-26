/** @enum */
export const ClickType = {
    /* Any action that triggers the context menu, so for example right click with a mouse or
    a long click with the finger on a touch device.*/
    CONTEXTMENU: 'CONTEXTMENU',
    /* A single click, with the left mouse button or with the finger on a touch device */
    LEFT_SINGLECLICK: 'LEFT_SINGLECLICK',
}

export class ClickInfo {
    /**
     * @param {[Number, Number]} clickInfo.coordinate Of the last click expressed in the current
     *   mapping projection
     * @param {[Number, Number]} [clickInfo.pixelCoordinate=[]] Position of the last click on the
     *   screen [x, y] in pixels (counted from top left corner). Default is `[]`
     * @param {SelectableFeature[]} [clickInfo.features=[]] List of potential features (geoJSON or
     *   KML) that where under the click. Default is `[]`
     * @param {ClickType} [clickInfo.clickType=ClickType.LEFT_SINGLECLICK] Which button of the mouse
     *   has been used to make this click. Default is `ClickType.LEFT_SINGLECLICK`
     */
    constructor(clickInfo) {
        const {
            coordinate = [],
            pixelCoordinate = [],
            features = [],
            clickType = ClickType.LEFT_SINGLECLICK,
        } = clickInfo
        this.coordinate = [...coordinate]
        this.pixelCoordinate = [...pixelCoordinate]
        this.features = [...features]
        this.clickType = clickType
    }
}

/**
 * Module that describe specific interaction with the map (dragging, clicking) and also serves as a
 * way to tell the map where to highlight stuff, or place a pin (in order to keep the rest of the
 * app ignorant of the mapping framework)
 */
export default {
    state: {
        /**
         * Information about the last click that has occurred on the map
         *
         * @type ClickInfo
         */
        clickInfo: null,
        /**
         * Coordinate of the dropped pin on the map. If null, no pin will be shown.
         *
         * @type Array<Number>
         */
        pinnedLocation: null,
        /**
         * Will be used to show the location of search entries when they are hovered. If we use the
         * same pinned location as the one above, the pinned location is lost as soon as another one
         * is hovered. Meaning that the search bar is still filled with a search query, but no
         * pinned location is present anymore.
         *
         * @type Array<Number>
         */
        previewedPinnedLocation: null,
        /**
         * Coordinate of the locationPop on the map. If null, locationPopup will not be shown.
         *
         * @type Array<Number>
         */
        locationPopupCoordinates: null,
    },
    actions: {
        /**
         * Sets all information about the last click that occurred on the map
         *
         * @param commit
         * @param {ClickInfo} clickInfo
         */
        click: ({ commit }, { clickInfo, dispatcher }) =>
            commit('setClickInfo', { clickInfo, dispatcher }),

        clearClick: ({ commit }, { dispatcher }) => {
            commit('setClickInfo', { clickInfo: null, dispatcher })
        },
        /**
         * Sets the dropped pin on the map, if coordinates are null the dropped pin is removed
         *
         * @param commit
         * @param {Number[]} coordinates Dropped pin location expressed in EPSG:3857
         */
        setPinnedLocation: ({ commit }, { coordinates, dispatcher }) => {
            if (Array.isArray(coordinates) && coordinates.length === 2) {
                commit('setPinnedLocation', { coordinates, dispatcher })
            } else {
                commit('setPinnedLocation', { coordinates: null, dispatcher })
            }
        },
        /**
         * @param commit
         * @param {Number[]} coordinates Dropped pin location expressed in EPSG:3857
         */
        setPreviewedPinnedLocation({ commit }, { coordinates, dispatcher }) {
            if (Array.isArray(coordinates) && coordinates.length === 2) {
                commit('setPreviewedPinnedLocation', { coordinates, dispatcher })
            } else {
                commit('setPreviewedPinnedLocation', { coordinates: null, dispatcher })
            }
        },
        clearPinnedLocation({ commit }, { dispatcher }) {
            commit('setPinnedLocation', { coordinates: null, dispatcher })
        },
        clearLocationPopupCoordinates({ commit }, { dispatcher }) {
            commit('setLocationPopupCoordinates', { coordinates: null, dispatcher })
        },
        /**
         * Sets the locationPopup on the map, if coordinates are null the locationPopup is removed
         *
         * @param commit
         * @param {Number[]} coordinates Location expressed in EPSG:3857
         */
        setLocationPopupCoordinates: ({ commit }, { coordinates, dispatcher }) => {
            if (Array.isArray(coordinates) && coordinates.length === 2) {
                commit('setLocationPopupCoordinates', { coordinates, dispatcher })
            } else {
                commit('setLocationPopupCoordinates', { coordinates: null, dispatcher })
            }
        },
    },
    mutations: {
        setClickInfo: (state, { clickInfo }) => (state.clickInfo = clickInfo),
        setPinnedLocation: (state, { coordinates }) => (state.pinnedLocation = coordinates),
        setPreviewedPinnedLocation: (state, { coordinates }) =>
            (state.previewedPinnedLocation = coordinates),
        setLocationPopupCoordinates: (state, { coordinates }) =>
            (state.locationPopupCoordinates = coordinates),
    },
}
