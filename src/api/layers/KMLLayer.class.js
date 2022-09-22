import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import i18n from '@/modules/i18n'

/** Metadata for an external KML layer, mostly used to show drawing */
export default class KMLLayer extends AbstractLayer {
    /**
     * @param {number} opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {string} kmlFileUrl The URL to access the KML data
     * @param {string | null} fileId The KML id (which is part of the kmlFileUrl). If null it is
     *   parsed from kmlFileUrl.
     * @param {string | null} adminId The admin id to allow editing. If null then the user is not
     *   allowed to edit the file.
     */
    constructor(opacity, kmlFileUrl, fileId = null, adminId = null) {
        super(i18n.global.t('draw_layer_label'), LayerTypes.KML, opacity)
        this.kmlFileUrl = kmlFileUrl
        this.adminId = adminId
        if (fileId) {
            this.fileId = fileId
        } else {
            // Based on the service-kml API reference the KML file URL has the following structure
            // <base-url>/kml/files/{kml_id}
            // or <base-url>/{kml_id} for legacy files, those one are redirected to <base-url>/kml/files/{kml_id}
            this.fileId = kmlFileUrl.split('/').pop()
        }
    }

    get name() {
        return i18n.global.t('draw_layer_label')
    }

    set name(name) {}

    getID() {
        // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
        let id = `KML|${this.kmlFileUrl}|${this.name}`
        if (this.adminId) {
            id += `@adminId=${this.adminId}`
        }
        return id
    }

    getURL() {
        return this.kmlFileUrl
    }
}
