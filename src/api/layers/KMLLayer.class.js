import AbstractLayer, { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { API_SERVICE_KML_BASE_URL } from '@/config'
import i18n from '@/modules/i18n'

/** Metadata for an external KML layer, mostly used to show drawing */
export default class KMLLayer extends AbstractLayer {
    /**
     * @param {string} kmlFileUrl The URL to access the KML data.
     * @param {boolean} [visible=true] If the layer is visible on the map (or hidden). When `null`
     *   is given, then it uses the default value. Default is `true`
     * @param {number | null} [opacity=1.0] The opacity of this layer, between 0.0 (transparent) and
     *   1.0 (opaque). When `null` is given, then it uses the default value. Default is `1.0`
     * @param {string | null} [adminId=null] The admin id to allow editing. If null then the user is
     *   not allowed to edit the file. Default is `null`
     * @param {string | null} [name=null] Name of this layer, if nothing is given a default name
     *   "Drawing" (or equivalent in the current UI lang) will be defined. Default is `null`
     * @param {string | null} [kmlData=null] Data/content of the KML file, as a string. Default is
     *   `null`
     * @param {object | null} [kmlMetadata=null] Metadata of the KML drawing. This object contains
     *   all the metadata returned by the backend. Default is `null`
     */
    constructor(
        kmlFileUrl,
        visible = null,
        opacity = null,
        adminId = null,
        name = null,
        kmlData = null,
        kmlMetadata = null
    ) {
        const isLocalFile = !kmlFileUrl.startsWith('http')
        const attributionName = isLocalFile ? kmlFileUrl : new URL(kmlFileUrl).hostname
        const isExternal = kmlFileUrl.indexOf(API_SERVICE_KML_BASE_URL) === -1
        const isLoading = !kmlData || (!kmlMetadata && !isExternal)
        super(
            name ?? i18n.global.t('draw_layer_label'),
            LayerTypes.KML,
            opacity ?? 1.0,
            visible ?? true,
            [new LayerAttribution(attributionName)],
            false,
            isExternal,
            isLoading
        )
        this.kmlFileUrl = kmlFileUrl
        this.adminId = adminId
        this.fileId = null
        if (!isLocalFile && !isExternal) {
            // Based on the service-kml API reference, the KML file URL has the following structure
            // <base-url>/kml/files/{kml_id} or <base-url>/{kml_id} for legacy files. Those one are
            // redirected to <base-url>/kml/files/{kml_id}
            this.fileId = kmlFileUrl.split('/').pop()
        }

        this.kmlData = kmlData
        this.kmlMetadata = kmlMetadata
    }

    getID() {
        // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
        return `KML|${this.kmlFileUrl}|${this.name}`
    }

    getURL(_epsgNumber, _timestamp) {
        return this.kmlFileUrl
    }

    /**
     * Return True if the KML Layer has not been drawned by this viewer.
     *
     * @returns {boolean}
     */
    isLegacy() {
        return this.kmlMetadata?.author !== 'web-mapviewer'
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
