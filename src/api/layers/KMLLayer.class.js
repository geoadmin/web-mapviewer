import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import i18n from '@/modules/i18n'

/** Metadata for an external KML layer, mostly used to show drawing */
export default class KMLLayer extends AbstractLayer {
    /**
     * @param {number} opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {boolean} visible If the layer is visible on the map (or hidden)
     * @param {string} kmlFileUrl The URL to access the KML data
     * @param {string | null} fileId The KML id (which is part of the kmlFileUrl). If null it is
     *   parsed from kmlFileUrl.
     * @param {string | null} adminId The admin id to allow editing. If null then the user is not
     *   allowed to edit the file.
     * @param {string | null} name Name of this layer, if nothing is given a default name "Drawing"
     *   (or equivalent in the current UI lang) will be defined
     * @param {object | null} metadata Metadata of the KML drawing. This object contains all the
     *   metadata returned by the backend.
     * @param {boolean} isExternal Flag telling if this KML comes from our backend (false) or is
     *   loaded from a different source (true)
     */
    constructor(
        opacity,
        visible,
        kmlFileUrl,
        fileId = null,
        adminId = null,
        name = null,
        metadata = null,
        isExternal = false
    ) {
        super(
            name ?? i18n.global.t('draw_layer_label'),
            LayerTypes.KML,
            opacity,
            visible,
            [], // no attributions set for KML layer (for now)
            false,
            isExternal
        )
        this.kmlFileUrl = decodeURIComponent(kmlFileUrl)
        this.adminId = adminId
        if (fileId) {
            this.fileId = fileId
        } else {
            // Based on the service-kml API reference the KML file URL has the following structure
            // <base-url>/kml/files/{kml_id}
            // or <base-url>/{kml_id} for legacy files, those one are redirected to <base-url>/kml/files/{kml_id}
            this.fileId = kmlFileUrl.split('/').pop()
        }
        this.metadata = metadata
    }

    getID() {
        // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
        let id = `KML|${encodeURIComponent(this.kmlFileUrl)}|${this.name}`
        if (this.adminId) {
            id += `@adminId=${this.adminId}`
        }
        return id
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
        if (this.metadata?.author === 'web-mapviewer') {
            return false
        }
        return true
    }
}
