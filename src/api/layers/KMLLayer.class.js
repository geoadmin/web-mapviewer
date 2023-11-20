import { getKmlMetadata } from '@/api/files.api'
import AbstractLayer, { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import i18n from '@/modules/i18n'

/** Metadata for an external KML layer, mostly used to show drawing */
export default class KMLLayer extends AbstractLayer {
    /**
     * @param {string} kmlFileUrl The URL to access the KML data.
     * @param {boolean} visible If the layer is visible on the map (or hidden).
     * @param {number | null} [opacity=1.0] The opacity of this layer, between 0.0 (transparent) and
     *   1.0 (opaque). When `null` is given, then it uses the default value. Default is `1.0`
     * @param {string | null} [fileId=null] The KML id (which is part of the kmlFileUrl). If null it
     *   is parsed from kmlFileUrl. Default is `null`
     * @param {string | null} [adminId=null] The admin id to allow editing. If null then the user is
     *   not allowed to edit the file. Default is `null`
     * @param {string | null} [name=null] Name of this layer, if nothing is given a default name
     *   "Drawing" (or equivalent in the current UI lang) will be defined. Default is `null`
     * @param {object | null} [metadata=null] Metadata of the KML drawing. This object contains all
     *   the metadata returned by the backend. Default is `null`
     * @param {boolean} [isExternal=false] Flag telling if this KML comes from our backend (false)
     *   or is loaded from a different source (true). Default is `false`
     * @param {boolean} [addToMap=true] Flag telling if the KML should be added to map by the layer
     *   management. When in drawing mode this flag is set to false to prevent layer map overlay to
     *   interfere with the drawing overlay. Default is `true`
     */
    constructor(
        kmlFileUrl,
        visible,
        opacity = null,
        fileId = null,
        adminId = null,
        name = null,
        metadata = null,
        isExternal = false,
        addToMap = true
    ) {
        super(
            name ?? i18n.global.t('draw_layer_label'),
            LayerTypes.KML,
            opacity ?? 1.0,
            visible,
            [new LayerAttribution(new URL(kmlFileUrl).hostname)],
            false,
            isExternal
        )
        this.kmlFileUrl = kmlFileUrl
        this.adminId = adminId
        if (fileId) {
            this.fileId = fileId
        } else {
            // Based on the service-kml API reference the KML file URL has the following structure
            // <base-url>/kml/files/{kml_id}
            // or <base-url>/{kml_id} for legacy files, those one are redirected to <base-url>/kml/files/{kml_id}
            this.fileId = this.kmlFileUrl.split('/').pop()
        }
        this.metadata = metadata
        this.addToMap = addToMap
    }

    getID() {
        // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
        return `KML|${this.kmlFileUrl}|${this.name}`
    }

    getURL() {
        return this.kmlFileUrl
    }

    /**
     * Return True if the KML Layer has not been drawned by this viewer.
     *
     * @returns {boolean}
     */
    isLegacy() {
        return !!(this.metadata?.author !== 'web-mapviewer')
    }

    /**
     * Get the KML layer metadata from backend or from cache
     *
     * @returns {Promise<Object>}
     */
    async getMetadata() {
        if (this.metadata) {
            return this.metadata
        }
        return await getKmlMetadata(this.fileId, this.adminId)
    }

    clone() {
        let clone = super.clone()
        if (this.metadata) {
            clone.metadata = Object.assign(
                Object.create(Object.getPrototypeOf(this.metadata)),
                this.metadata
            )
        }
        return clone
    }
}
