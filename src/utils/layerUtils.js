export class ActiveLayerConfig {
    /**
     * @param {String} id The layer id
     * @param {Boolean} visible Flag telling if the layer should be visible on the map
     * @param {Number | undefined} opacity The opacity that the layers should have, when `undefined`
     *   uses the default opacity for the layer.
     * @param {Object} customAttributes Other attributes relevant for this layer, such as time
     */
    constructor(id, visible, opacity = undefined, customAttributes = {}) {
        this.id = id
        this.visible = visible
        this.opacity = opacity
        this.customAttributes = customAttributes
    }
}
