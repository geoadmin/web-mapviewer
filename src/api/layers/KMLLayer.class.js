import LayerTypes from '@/api/layers/LayerTypes.enum'
import AbstractLayer from '@/api/layers/AbstractLayer.class'

/** Metadata for an external KML layer, mostly used to show drawing */
export default class KMLLayer extends AbstractLayer {
    /**
     * @param name The name of this layer in the current lang
     * @param opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param kmlFileUrl The URL to access the KML data
     */
    constructor(name, opacity, kmlFileUrl) {
        super(name, LayerTypes.KML, opacity)
        this.kmlFileUrl = kmlFileUrl
    }

    getID() {
        // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
        return `KML|${this.kmlFileUrl}|${this.name}`
    }

    getURL() {
        return this.kmlFileUrl
    }
}
