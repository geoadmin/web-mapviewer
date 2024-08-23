import AbstractLayer, { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import { EMPTY_KML_DATA, parseKmlName } from '@/utils/kmlUtils'

/**
 * Metadata for an external KML layer, mostly used to show drawing
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class KMLLayer extends AbstractLayer {
    /**
     * @param {String} kmlLayerData.kmlFileUrl The URL to access the KML data.
     * @param {Boolean} [kmlLayerData.visible=true] If the layer is visible on the map (or hidden).
     *   When `null` is given, then it uses the default value. Default is `true`
     * @param {Number} [kmlLayerData.opacity=1.0] The opacity of this layer, between 0.0
     *   (transparent) and 1.0 (opaque). When `null` is given, then it uses the default value.
     *   Default is `1.0`
     * @param {String | null} [kmlLayerData.adminId=null] The admin id to allow editing. If null
     *   then the user is not allowed to edit the file. Default is `null`
     * @param {String | null} [kmlLayerData.kmlData=null] Data/content of the KML file, as a string.
     *   Default is `null`
     * @param {KmlMetadata | null} [kmlLayerData.kmlMetadata=null] Metadata of the KML drawing. This
     *   object contains all the metadata returned by the backend. Default is `null`
     * @throws InvalidLayerDataError if no `gpxLayerData` is given or if it is invalid
     */
    constructor(kmlLayerData) {
        if (!kmlLayerData) {
            throw new InvalidLayerDataError('Missing KML layer data', kmlLayerData)
        }
        const {
            kmlFileUrl = null,
            visible = true,
            opacity = 1.0,
            adminId = null,
            kmlData = null,
            kmlMetadata = null,
        } = kmlLayerData
        if (kmlFileUrl === null) {
            throw new InvalidLayerDataError('Missing KML file URL', kmlLayerData)
        }
        const isLocalFile = !kmlFileUrl.startsWith('http')
        const attributionName = isLocalFile ? kmlFileUrl : new URL(kmlFileUrl).hostname
        const isExternal = kmlFileUrl.indexOf(getServiceKmlBaseUrl()) === -1
        super({
            name: 'KML',
            id: kmlFileUrl,
            type: LayerTypes.KML,
            baseUrl: kmlFileUrl,
            opacity: opacity ?? 1.0,
            visible: visible ?? true,
            attributions: [new LayerAttribution(attributionName)],
            isExternal,
            hasDescription: false,
            hasLegend: false,
        })
        this.kmlFileUrl = kmlFileUrl
        this.adminId = adminId
        this.fileId = null
        if (!isLocalFile && !isExternal) {
            // Based on the service-kml API reference, the KML file URL has the following structure
            // <base-url>/kml/files/{kml_id} or <base-url>/{kml_id} for legacy files. Those one are
            // redirected to <base-url>/kml/files/{kml_id}
            this.fileId = kmlFileUrl.split('/').pop()
        }

        this.kmlMetadata = kmlMetadata
        if (kmlData) {
            this.name = parseKmlName(kmlData)
            this.isLoading = false
        } else {
            this.isLoading = true
        }
        this.kmlData = kmlData
    }

    /**
     * Return True if the KML Layer has not been drawned by this viewer.
     *
     * @returns {boolean}
     */
    isLegacy() {
        return this.kmlMetadata?.author !== 'web-mapviewer'
    }

    isEmpty() {
        return !this.kmlData || this.kmlData === EMPTY_KML_DATA
    }

    clone() {
        let clone = super.clone()
        if (this.kmlMetadata) {
            clone.kmlMetadata = Object.assign(
                Object.create(Object.getPrototypeOf(this.kmlMetadata)),
                this.kmlMetadata
            )
        }
        return clone
    }
}
