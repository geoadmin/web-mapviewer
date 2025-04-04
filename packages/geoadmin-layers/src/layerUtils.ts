import { merge } from 'lodash'

import {
    DEFAULT_OPACITY,
    type GeoAdminAPILayer,
    WMTSEncodingType,
    LayerType,
    type ExternalWMTSLayer,
    type GeoAdminWMSLayer,
    type GeoAdminWMTSLayer,
    type ExternalWMSLayer,
    type KMLLayer,
    KmlStyle,
    type GPXLayer,
} from '@/layers'
import * as timeConfigUtils from '@/timeConfigUtils'
import { InvalidLayerDataError } from '@/validation'

// TODO this is taken from map.config.js. We don't want coupling to that module, so think about
// handling this
const DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION = 0.5 // meters/pixel

export const EMPTY_KML_DATA = '<kml></kml>'

const ENC_PIPE = '%7C'

/**
 * Encode an external layer parameter.
 *
 * This percent encode the special character | used to separate external layer parameters.
 *
 * NOTE: We don't use encodeURIComponent here because the Vue Router will anyway do the
 * encodeURIComponent() therefore by only encoding | we avoid to encode other special character
 * twice. But we need to encode | twice to avoid layer parsing issue.
 *
 * @param {string} param Parameter to encode
 * @returns {string} Percent encoded parameter
 */
export function encodeExternalLayerParam(param: string) {
    return param.replace('|', ENC_PIPE)
}

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
        hasWarning: false,
    }

    return merge(defaults, values)
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
        hasWarning: false,
    }

    return merge(defaults, values)
}

/**
 * Construct a basic WMTS layer with all the necessary defaults
 *
 * This is a helper that can work with a subset of the GeoAdminWMSLayer properties. The missing
 * values from the function parameter will be used from defaults
 *
 * @param values An object of partial values from ExternalWMTSLayer
 * @returns ExternalWMTSLayer
 */
export const makeExternalWMTSLayer = (values: Partial<ExternalWMTSLayer>): ExternalWMTSLayer => {
    const baseUrl = values.baseUrl ?? ''
    const hasDescription = (values?.abstract?.length ?? 0) > 0 || (values?.legends?.length ?? 0) > 0
    const attributions = [{ name: new URL(baseUrl).hostname }]
    const hasLegend = (values?.legends ?? []).length > 0

    const defaults = {
        id: '',
        name: '',
        isExternal: true,
        type: LayerType.WMTS as LayerType.WMTS,
        baseUrl,
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
        hasTooltip: false,
        hasDescription,
        searchable: false,
        hasLegend,
        isLoading: true,
        hasError: false,
        currentYear: undefined,
        attributions,
        hasWarning: false,
    }

    if (values.currentYear && values.timeConfig) {
        const timeEntry = timeConfigUtils.getTimeEntryForYear(values.timeConfig, values.currentYear)
        if (timeEntry) {
            timeConfigUtils.updateCurrentTimeEntry(values.timeConfig, timeEntry)
        }
    }

    // if hasDescription or attributions were provided in `values`, then these would
    // override the ones we inferred above
    return merge(defaults, values)
}

export const makeExternalWMSLayer = (values: Partial<ExternalWMSLayer>): ExternalWMSLayer => {
    const hasDescription = (values?.abstract?.length ?? 0) > 0 || (values?.legends?.length ?? 0) > 0
    const attributions = [{ name: new URL(values.baseUrl!).hostname }]
    const hasLegend = (values?.legends ?? []).length > 0

    const defaults = {
        id: '',
        name: '',
        opacity: 1.0,
        visible: true,
        baseUrl: '',
        layers: [],
        attributions,
        hasDescription,
        wmsVersion: '1.3.0',
        format: 'png' as 'png' | 'jpeg',
        hasLegend,
        abstract: '',
        extent: undefined,
        legends: [],
        isLoading: true,
        availableProjections: [],
        hasTooltip: false,
        getFeatureInfoCapability: null,
        dimensions: [],
        timeConfig: undefined,
        currentYear: undefined,
        customAttributes: undefined,
        type: LayerType.WMS as LayerType.WMS,
        isExternal: true,
        hasError: false,
        hasWarning: false,
    }

    if (values.currentYear && values.timeConfig) {
        const timeEntry = timeConfigUtils.getTimeEntryForYear(values.timeConfig, values.currentYear)
        if (timeEntry) {
            timeConfigUtils.updateCurrentTimeEntry(values.timeConfig, timeEntry)
        }
    }

    return merge(defaults, values)
}

export const makeKmlLayer = (values: Partial<KMLLayer>): KMLLayer => {
    const defaults = {
        id: '',
        name: '',
        opacity: 1.0,
        visible: true,
        baseUrl: '',
        layers: [],
        extent: null,
        clampToGround: false,
        isExternal: false,
        kmlFileUrl: '',
        fileId: '',
        kmlData: null,
        kmlMetadata: null,
        isLocalFile: false,
        attributions: [],
        style: KmlStyle.DEFAULT,
        type: LayerType.KML,
        hasTooltip: false,
        hasError: false,
        hasWarning: false,
        hasDescription: false,
        hasLegend: false,
        isLoading: true,
        adminId: null,
    }

    return merge(defaults, values)
}

export const makeGPXLayer = (values: Partial<GPXLayer>): GPXLayer => {
    const isLocalFile = !values.gpxFileUrl?.startsWith('http')
    if (!values.gpxFileUrl) {
        throw new InvalidLayerDataError('Missing GPX file URL', values)
    }
    const attributionName = isLocalFile ? values.gpxFileUrl : new URL(values.gpxFileUrl).hostname
    const attributions = [{ name: attributionName }]
    const name = values.gpxMetadata?.name ?? 'GPX'

    const defaults = {
        baseUrl: values.gpxFileUrl,
        gpxFileUrl: null,
        gpxData: null,
        gpxMetadata: null,
        extent: null,
        name: name,
        id: `GPX|${encodeExternalLayerParam(values.gpxFileUrl)}`,
        type: LayerType.GPX,
        opacity: 0,
        visible: false,
        attributions,
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isExternal: true,
        hasError: false,
        hasWarning: false,
        isLoading: !values.gpxData,
    }

    return merge(defaults, values)
}

export const isKmlLayerLegacy = (layer: KMLLayer): boolean => {
    return layer.kmlMetadata?.author !== 'web-mapviewer'
}

export const isKmlLayerEmpty = (layer: KMLLayer): boolean =>
    !layer.kmlData || layer.kmlData === EMPTY_KML_DATA

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
