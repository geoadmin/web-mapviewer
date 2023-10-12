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
     * @param {Number[]} coordinate Of the last click expressed in EPSG:3857
     * @param {Number[]} pixelCoordinate Position of the last click on the screen [x, y] in pixels
     *   (counted from top left corner)
     * @param {Object[]} features List of potential features (geoJSON or KML) that where under the
     *   click
     * @param {ClickType} clickType Which button of the mouse has been used to make this click
     */
    constructor(
        coordinate = [],
        pixelCoordinate = [],
        features = [],
        clickType = ClickType.LEFT_SINGLECLICK
    ) {
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
         * @type Boolean Whether the map is being dragged right now or not (if the mouse/touch is
         *   down and cursor moving)
         */
        isBeingDragged: false,
        /** @type ClickInfo Information about the last click that has occurred on the map */
        clickInfo: null,
        /**
         * @type Array<Number> Coordinate of the dropped pin on the map, expressed in EPSG:3857. If
         *   null, no pin will be shown.
         */
        pinnedLocation: null,
        /**
         * @type Array<Number> Same thing as pinnedLocation, will be used to show location of search
         *   entries when they are hovered. If we use the same pinned location as the one above, the
         *   pinned location is lost as soon as another one is hovered (meaning that the search bar
         *   is still filled with a search query, but no pinned location is present anymore)
         */
        previewedPinnedLocation: null,

        displayLocationPopup: false,
    },
    actions: {
        /**
         * Sets all information about the last click that occurred on the map
         *
         * @param commit
         * @param {ClickInfo} clickInfo
         */
        click: ({ commit }, clickInfo) => commit('setClickInfo', clickInfo),
        clearClick: ({ commit }) => commit('setClickInfo', null),
        mapStartBeingDragged: ({ commit }) => commit('mapStartBeingDragged'),
        mapStoppedBeingDragged: ({ commit }) => commit('mapStoppedBeingDragged'),
        /**
         * Sets the dropped pin on the map, if coordinates are null the dropped pin is removed
         *
         * @param commit
         * @param {Number[]} coordinates Dropped pin location expressed in EPSG:3857
         */
        setPinnedLocation: ({ commit }, coordinates) => {
            if (Array.isArray(coordinates) && coordinates.length === 2) {
                commit('setPinnedLocation', coordinates)
            } else {
                commit('setPinnedLocation', null)
            }
        },
        /**
         * @param commit
         * @param {Number[]} coordinates Dropped pin location expressed in EPSG:3857
         */
        setPreviewedPinnedLocation({ commit }, coordinates) {
            if (Array.isArray(coordinates) && coordinates.length === 2) {
                commit('setPreviewedPinnedLocation', coordinates)
            } else {
                commit('setPreviewedPinnedLocation', null)
            }
        },
        clearPinnedLocation({ commit }) {
            commit('setPinnedLocation', null)
        },
        displayLocationPopup({ commit }) {
            commit('setDisplayLocationPopup', true)
        },
        hideLocationPopup({ commit }) {
            commit('setDisplayLocationPopup', false)
        },
    },
    mutations: {
        setClickInfo: (state, clickInfo) => (state.clickInfo = clickInfo),
        mapStartBeingDragged: (state) => (state.isBeingDragged = true),
        mapStoppedBeingDragged: (state) => (state.isBeingDragged = false),
        setPinnedLocation: (state, coordinates) => (state.pinnedLocation = coordinates),
        setPreviewedPinnedLocation: (state, coordinate) =>
            (state.previewedPinnedLocation = coordinate),
        setDisplayLocationPopup: (state, display) => (state.displayLocationPopup = display),
    },
}
