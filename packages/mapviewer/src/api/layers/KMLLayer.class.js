import AbstractLayer, { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'
import KmlStyles from '@/api/layers/KmlStyles.enum'
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
     * @param {String} [kmlLayerData.name] The name for this KML layer. If none is given, 'KML' will
     *   be used.
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
     * @param {Map<string, ArrayBuffer>} [kmlLayerData.linkFiles=Map()] Map of KML link files. Those
     *   files are usually sent with the kml inside a KMZ archive and can be referenced inside the
     *   KML (e.g. icon, image, ...). Default is `Map()`
     * @param {[Number, Number, Number, Number] | null} kmlLayerData.extent
     * @param {KmlStyles} kmlLayerData.style
     * @param {Boolean} [kmlLayerData.clampToGround] Flag defining if the KML should be clamped to
     *   the 3D terrain (only for 3D viewer). If not set, the clamp to ground flag will be set to
     *   true if the KML is coming from geoadmin (drawing). Some users wanted to have 3D KMLs (fly
     *   tracks) that were not clamped to the ground (they are providing height values), and others
     *   wanted to have their flat surface visible on the ground, so that is the way to please both
     *   crowds.
     * @throws InvalidLayerDataError if no `kmlLayerData` is given or if it is invalid
     */
    constructor(kmlLayerData) {
        if (!kmlLayerData) {
            throw new InvalidLayerDataError('Missing KML layer data', kmlLayerData)
        }
        const {
            name = null,
            kmlFileUrl = null,
            visible = true,
            opacity = 1.0,
            adminId = null,
            kmlData = null,
            kmlMetadata = null,
            linkFiles = new Map(),
            extent = null,
            extentProjection = null,
            style = null,
            clampToGround = null,
        } = kmlLayerData
        if (kmlFileUrl === null) {
            throw new InvalidLayerDataError('Missing KML file URL', kmlLayerData)
        }
        const isLocalFile = !kmlFileUrl.startsWith('http')
        const attributionName = isLocalFile ? kmlFileUrl : new URL(kmlFileUrl).hostname
        const isExternal = kmlFileUrl.indexOf(getServiceKmlBaseUrl()) === -1
        super({
            name: name ?? 'KML',
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
            if (!this.name || this.name === '') {
                this.name = isLocalFile
                    ? kmlFileUrl
                    : // only keeping what is after the last slash
                      kmlFileUrl.split('/').pop()
            }
            this.isLoading = false
        } else {
            this.isLoading = true
        }
        this.kmlData = kmlData
        this.linkFiles = linkFiles
        this.extent = extent
        this.extentProjection = extentProjection
        if (style === null) {
            // if no style was given, we select the default style depending on the origin of the KML
            if (isExternal) {
                this.style = KmlStyles.DEFAULT
            } else {
                this.style = KmlStyles.GEOADMIN
            }
        } else {
            this.style = style
        }
        // if clampToGround isn't defined, we set it to true in case we are dealing with a geoadmin KML
        this.clampToGround = clampToGround === null ? !isExternal : clampToGround
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
