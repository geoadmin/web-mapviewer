import type { Layer } from '@geoadmin/layers'
import type { GeoJsonProperties } from 'geojson'

import { LayerType } from '@geoadmin/layers'

import SelectableFeature, {
    type SelectableFeatureData,
} from '@/api/features/SelectableFeature.class'

interface LayerFeatureData extends Omit<SelectableFeatureData, 'isEditable'> {
    /** The layer in which this feature belongs */
    layer: Layer
    /** Data for this feature's popup (or tooltip). */
    data: GeoJsonProperties | Object | String
}

/** Describe a feature from the backend, so a feature linked to a backend layer. */
export default class LayerFeature extends SelectableFeature {
    readonly layer: Layer
    readonly data: GeoJsonProperties | Object | String
    /**
     * If sanitization should take place before rendering the popup (as HTML) or not (trusted
     * source)
     *
     * We can't trust the content of the popup data for external layers, and for KML layers. For
     * KML, the issue is that users can create text-rich (HTML) description with links, and such. It
     * would then be possible to do some XSS through this, so we need to sanitize this before
     * showing it.
     */
    readonly popupDataCanBeTrusted: boolean

    constructor(featureData: LayerFeatureData) {
        super({
            ...featureData,
            isEditable: false,
        })
        const { layer, data } = featureData
        this.layer = layer
        this.data = data
        this.popupDataCanBeTrusted = !this.layer.isExternal && this.layer.type !== LayerType.KML
    }
}
