import AbstractLayer, { LayerAttribution } from '@/api/layers/AbstractLayer.class.js'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error.js'
import LayerTypes from '@/api/layers/LayerTypes.enum.js'

export default class GPXLayer extends AbstractLayer {
    /**
     * @param {String} gpxLayerData.gpxFileUrl URL to the GPX file (can also be a local file URI)
     * @param {Boolean} [gpxLayerData.visible=true] If the layer is visible on the map (or hidden).
     *   Default is `true`
     * @param {Number} [gpxLayerData.opacity=1.0] The opacity of this layer, between 0.0
     *   (transparent) and 1.0 (opaque). Default is `1.0`
     * @param {String | null} [gpxLayerData.gpxData=null] Data/content of the GPX file, as a string.
     *   Default is `null`
     * @param {GPXMetadata | null} [gpxLayerData.gpxMetadata=null] Metadata of the GPX file. This
     *   object contains all the metadata found in the file itself within the <metadata> tag.
     *   Default is `null`
     * @throws InvalidLayerDataError if no `gpxLayerData` is given or if it is invalid
     */
    constructor(gpxLayerData) {
        if (!gpxLayerData) {
            throw new InvalidLayerDataError('Missing GPX layer data', gpxLayerData)
        }
        const {
            gpxFileUrl = null,
            visible = true,
            opacity = 1.0,
            gpxData = null,
            gpxMetadata = null,
        } = gpxLayerData
        if (gpxFileUrl === null) {
            throw new InvalidLayerDataError('Missing GPX file URL', gpxLayerData)
        }
        const isLocalFile = !gpxFileUrl.startsWith('http')
        const attributionName = isLocalFile ? gpxFileUrl : new URL(gpxFileUrl).hostname
        super({
            name: gpxMetadata?.name ?? 'GPX',
            id: `GPX|${gpxFileUrl}`,
            type: LayerTypes.GPX,
            opacity: opacity,
            visible: visible,
            attributions: [new LayerAttribution(attributionName)],
            hasTooltip: false,
            hasLegend: false,
            isExternal: true,
            isLoading: !!gpxData && !!gpxMetadata,
        })
        this.gpxFileUrl = gpxFileUrl
        this.gpxData = gpxData
        this.gpxMetadata = gpxMetadata
    }

    getURL(_epsgNumber, _timestamp) {
        return this.gpxFileUrl
    }
}
