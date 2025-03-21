import {
    DEFAULT_OPACITY,
    type GeoAdminAPILayer,
    WMTSEncodingType,
    LayerType,
    type ExternalWMTSLayer,
    type GeoAdminWMSLayer,
    type GeoAdminWMTSLayer,
} from '@/layers'

// TODO this is taken from map.config.js. We don't want coupling to that module, so think about
// handling this
const DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION = 0.5 // meters/pixel

// TODO think about validations

/**
 * Construct a basic GeoAdmin WMS Layer
 *
 * This is a helper that can work with a subset of the GeoAdminWMSLayer properties. The missing
 * values from the function parameter will be used from defaults
 *
 * @param values
 * @returns
 */
export const makeGeoAdminWMSLayer = (values: Partial<GeoAdminWMSLayer>): GeoAdminWMSLayer => {
    const defaults = {
        id: '',
        name: '',
        isExternal: false,
        type: LayerType.WMS as LayerType.WMS,
        opacity: DEFAULT_OPACITY,
        visible: true,
        isLoading: false,
        baseUrl: '',
        gutter: 0,
        wmsVersion: '1.3.0',
        lang: 'en',
        isHighlightable: false,
        hasTooltip: false,
        topics: [],
        hasLegend: false,
        searchable: false,
        format: 'png' as 'png' | 'jpeg',
        technicalName: '',
        isSpecificFor3d: false,
        attributions: [],
        hasDescription: true,
        hasError: false,
    }

    return { ...defaults, ...values }
}

export const makeGeoAdminWMTSLayer = (values: Partial<GeoAdminWMTSLayer>): GeoAdminWMTSLayer => {
    const defaults = {
        name: '',
        id: '',
        type: LayerType.WMTS as LayerType.WMTS,
        idIn3d: undefined,
        technicalName: undefined,
        opacity: 1.0,
        visible: true,
        format: 'png' as 'png' | 'jpeg',
        isBackground: false,
        // TODO should we use the getBaseUrl here?
        baseUrl: '',
        isHighlightable: false,
        hasTooltip: false,
        topics: [],
        hasLegend: false,
        searchable: false,
        maxResolution: DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION,
        isSpecificFor3d: false,
        attributions: [],
        hasDescription: true,
        isExternal: false,
        isLoading: false,
        hasError: false,
    }

    return { ...defaults, ...values }
}

/**
 * Construct a basic WMTS layer with all the necessary defaults
 *
 * This is a helper that can work with a subset of the GeoAdminWMSLayer properties. The missing
 * values from the function parameter will be used from defaults
 *
 * @param values
 * @returns
 */
export const makeExternalWMTSLayer = (values: Partial<ExternalWMTSLayer>): ExternalWMTSLayer => {
    const defaults = {
        id: '',
        name: '',
        isExternal: true,
        type: LayerType.WMTS as LayerType.WMTS,
        opacity: DEFAULT_OPACITY,
        visible: true,
        abstract: '',
        legends: [],
        availableProjections: [],
        getTileEncoding: WMTSEncodingType.REST,
        urlTemplate: '',
        style: '',
        tileMatrixSets: [],
        dimensions: [],
        attributions: [],
        hasTooltip: false,
        hasDescription: true,
        searchable: false,
        hasLegend: false,
        isLoading: true,
        hasError: false,
    }

    return { ...defaults, ...values }
}

/**
 * Returns which topic should be used in URL that needs one topic to be defined (identify or
 * htmlPopup for instance). By default and whenever possible, the viewer should use `ech`. If `ech`
 * is not present in the topics, the first of them should be used to request the backend.
 *
 * @returns {String} The topic to use in request to the backend for this layer
 */
export function getTopicForIdentifyAndTooltipRequests(layer: GeoAdminAPILayer) {
    // by default, the frontend should always request `ech`, so if there's no topic that's what we do
    // if there are some topics, we look if `ech` is one of them, if so we return it
    if (layer.topics.length === 0 || layer.topics.indexOf('ech') !== -1) {
        return 'ech'
    }
    // otherwise we return the first topic to make our backend requests for identify and htmlPopup
    return layer.topics[0]
}
