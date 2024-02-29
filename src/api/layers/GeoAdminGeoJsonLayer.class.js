import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/**
 * Metadata for a GeoJSON layer
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class GeoAdminGeoJsonLayer extends GeoAdminLayer {
    /**
     * @param name The name of this layer in the current lang
     * @param id The unique ID of this layer in our backend
     * @param opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {boolean} visible If the layer should be shown on the map
     * @param {LayerAttribution[]} attributions Description of the data owner(s) for this layer
     * @param geoJsonUrl The URL to use when requesting the GeoJSON data (the true GeoJSON per
     *   se...)
     * @param styleUrl The URL to use to request the styling to apply to the data
     * @param {Number | null} updateDelay Delay after which the data of this layer should be
     *   re-requested (if null is given, no further data reload will be triggered)
     */
    constructor({
        name = null,
        id = null,
        opacity = 1.0,
        visible = true,
        attributions = [],
        geoJsonUrl = null,
        styleUrl = null,
        updateDelay = null,
    }) {
        super({
            name,
            type: LayerTypes.GEOJSON,
            geoAdminId: id,
            serverLayerId: id,
            opacity,
            visible,
            attributions,
            isLoading: true,
        })
        this.geoJsonUrl = geoJsonUrl
        this.styleUrl = styleUrl

        this.geoJsonData = null
        this.geoJsonStyle = null
        this.updateDelay = updateDelay
    }

    getURL(_epsgNumber, _timestamp) {
        return this.geoJsonUrl
    }
}
