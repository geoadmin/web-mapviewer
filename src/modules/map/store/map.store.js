export class ClickInfo {
  /**
   * @param {Array<Number>} coordinate of the last click expressed in EPSG:3857
   * @param {Number} millisecondsSpentMouseDown time spend with the mouse button down for the last click. Useful to determine if this was a quick touch or a long press on mobile (not the same feedback to the user, see click-on-map-management.plugin .js)
   * @param {Array<Number>} pixelCoordinate position of the last click on the screen [x, y] in pixels (counted from top left corner)
   * @param {Array<Object>} geoJsonFeatures list of potential GeoJSON features that where under the click
   */
  constructor(
    coordinate = [],
    millisecondsSpentMouseDown = -1,
    pixelCoordinate = [],
    geoJsonFeatures = []
  ) {
    this.coordinate = [...coordinate]
    this.millisecondsSpentMouseDown = millisecondsSpentMouseDown
    this.pixelCoordinate = [...pixelCoordinate]
    this.geoJsonFeatures = [...geoJsonFeatures]
  }
}

/**
 * Module that describe specific interaction with the map (dragging, clicking) and also serves as a way to tell the map
 * where to highlight stuff, or place a pin (in order to keep the rest of the app ignorant of the mapping framework)
 */
export default {
  state: {
    /**
     * @type Array<Feature>
     * list of features to highlight on the map (features that are currently shown in the tooltip)
     */
    highlightedFeatures: [],
    /**
     * @type WMSLayer|WMTSLayer|GeoJsonLayer|AggregateLayer
     * layer that will be highlighted (put on top of all other layers) on the map. Used to show a layer from the search result when hovered by the mouse cursor.
     */
    highlightedLayer: null,
    /**
     * @type Boolean
     * whether the map is being dragged right now or not (if the mouse/touch is down and cursor moving)
     */
    isBeingDragged: false,
    /**
     * @type ClickInfo
     * Information about the last click that has occurred on the map
     */
    clickInfo: null,
    /**
     * @type Array<Number>
     * coordinate of the dropped pin on the map, expressed in EPSG:3857. If null, no pin will be shown.
     */
    pinnedLocation: null,
  },
  getters: {},
  actions: {
    /**
     * Tells the map to show a layer that is not (yet) in the visible layers on the map. This is useful to make a quick overview of the layer while hovering it in the search results.
     * @param commit
     * @param {WMSLayer|WMTSLayer|GeoJsonLayer|AggregateLayer} layer the layer to be highlighted
     */
    highlightLayer: ({ commit }, layer) => commit('setHighlightedFeature', layer),
    /**
     * Tells the map to highlight a list of features (place a round marker at their location). Those features are currently shown by the tooltip.
     * @param commit
     * @param {Array<Feature>} features a list of feature we want to highlight on the map
     */
    setHighlightedFeatures: ({ commit }, features) => {
      if (Array.isArray(features)) {
        commit('setHighlightedFeatures', features)
      }
    },
    /**
     * Removes all highlighted features from the map
     */
    clearHighlightedFeatures: ({ commit }) => commit('setHighlightedFeatures', []),
    /**
     * Sets all information about the last click that occurred on the map
     * @param commit
     * @param {ClickInfo} clickInfo
     */
    click: ({ commit }, clickInfo) => commit('setClickInfo', clickInfo),
    mapStartBeingDragged: ({ commit }) => commit('mapStartBeingDragged'),
    mapStoppedBeingDragged: ({ commit }) => commit('mapStoppedBeingDragged'),
    /**
     * Sets the dropped pin on the map, if coordinates are null the dropped pin is removed
     * @param commit
     * @param {Array<Number>} coordinates dropped pin location expressed in EPSG:3857
     */
    setPinnedLocation: ({ commit }, coordinates) => {
      if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
        commit('setPinnedLocation', coordinates)
      } else {
        commit('setPinnedLocation', null)
      }
    },
  },
  mutations: {
    setHighlightedLayer: (state, layer) => (state.highlightedLayer = layer),
    setHighlightedFeatures: (state, features) => (state.highlightedFeatures = features),
    setClickInfo: (state, clickInfo) => (state.clickInfo = clickInfo),
    mapStartBeingDragged: (state) => (state.isBeingDragged = true),
    mapStoppedBeingDragged: (state) => (state.isBeingDragged = false),
    setPinnedLocation: (state, coordinates) => (state.pinnedLocation = coordinates),
  },
}
