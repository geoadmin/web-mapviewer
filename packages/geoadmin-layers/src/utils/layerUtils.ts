import { cloneDeep, merge, omit } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import {
    type Layer,
    DEFAULT_OPACITY,
    type GeoAdminLayer,
    WMTSEncodingType,
    LayerType,
    type ExternalWMTSLayer,
    type GeoAdminWMSLayer,
    type GeoAdminWMTSLayer,
    type ExternalWMSLayer,
    type KMLLayer,
    KmlStyle,
    type GPXLayer,
    type GeoAdminVectorLayer,
    type GeoAdmin3DLayer,
    type CloudOptimizedGeoTIFFLayer,
    type GeoAdminAggregateLayer,
    type GeoAdminGeoJSONLayer,
    type GeoAdminGroupOfLayers,
    type AggregateSubLayer,
} from '@/types/layers'
import * as timeConfigUtils from '@/utils/timeConfigUtils'
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

const validateBaseData = (values: Partial<Layer>): void => {
    if (values.name === null) {
        throw new InvalidLayerDataError('Missing layer name', values)
    }
    if (values.id === null) {
        throw new InvalidLayerDataError('Missing layer ID', values)
    }
    if (values.type === null) {
        throw new InvalidLayerDataError('Missing layer type', values)
    }
    if (values.baseUrl === null) {
        throw new InvalidLayerDataError('Missing base URL', values)
    }
}

/**
 * Construct a basic GeoAdmin WMS Layer
 *
 * This is a helper that can work with a subset of the GeoAdminWMSLayer properties. The missing
 * values from the function parameter will be used from defaults
 *
 * @param values GeoAdminWMSLayer partial
 * @returns GeoAdminWMSLayer
 */
export const makeGeoAdminWMSLayer = (values: Partial<GeoAdminWMSLayer>): GeoAdminWMSLayer => {
    validateBaseData(values)
    const defaults = {
        uuid: uuidv4(),
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
        timeConfig: null,
    }

    return merge(defaults, values)
}

/**
 * Construct a basic GeoAdmin WMTS Layer
 *
 * This is a helper that can work with a subset of the GeoAdminWMTSLayer properties. The missing
 * values from the function parameter will be used from defaults
 *
 * @param values An object of partial values from GeoAdminWMTSLayer
 * @returns GeoAdminWMTSLayer
 */
export const makeGeoAdminWMTSLayer = (values: Partial<GeoAdminWMTSLayer>): GeoAdminWMTSLayer => {
    validateBaseData(values)
    const defaults = {
        uuid: uuidv4(),
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
        timeConfig: null,
    }

    return merge(defaults, values)
}

/**
 * Construct a basic WMTS layer with all the necessary defaults
 *
 * This is a helper that can work with a subset of the GeoAdminWMSLayer properties. The missing
 * values from the function parameter will be useLayerTypesd from defaults
 *
 * @param values An object of partial values from ExternalWMTSLayer
 * @returns ExternalWMTSLayer
 */
export const makeExternalWMTSLayer = (values: Partial<ExternalWMTSLayer>): ExternalWMTSLayer => {
    validateBaseData(values)

    const baseUrl = values.baseUrl ?? ''
    const hasDescription = (values?.abstract?.length ?? 0) > 0 || (values?.legends?.length ?? 0) > 0
    const attributions = [{ name: new URL(baseUrl).hostname }]
    const hasLegend = (values?.legends ?? []).length > 0

    const defaults = {
        uuid: uuidv4(),
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
        timeConfig: null,
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

/**
 * Construct an external WMSLayer
 *
 * This is a helper that can work with a subset of the WMSLayer properties. The missing values from
 * the function parameter will be useLayerTypesd from defaults
 *
 * @param values Partial values of WMSLayer
 * @returns ExternalWMSLayer
 */
export const makeExternalWMSLayer = (values: Partial<ExternalWMSLayer>): ExternalWMSLayer => {
    validateBaseData(values)
    const hasDescription = (values?.abstract?.length ?? 0) > 0 || (values?.legends?.length ?? 0) > 0
    const attributions = [{ name: new URL(values.baseUrl!).hostname }]
    const hasLegend = (values?.legends ?? []).length > 0

    const defaults = {
        uuid: uuidv4(),
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
        currentYear: undefined,
        customAttributes: undefined,
        type: LayerType.WMS as LayerType.WMS,
        isExternal: true,
        hasError: false,
        hasWarning: false,
        timeConfig: null,
    }

    if (values.currentYear && values.timeConfig) {
        const timeEntry = timeConfigUtils.getTimeEntryForYear(values.timeConfig, values.currentYear)
        if (timeEntry) {
            timeConfigUtils.updateCurrentTimeEntry(values.timeConfig, timeEntry)
        }
    }

    return merge(defaults, values)
}

/**
 * Construct a KML Layer
 *
 * This is a helper that can work with a subset of the KMLLayer properties. The missing values from
 * the function parameter will be used from defaults
 *
 * @param values Partial values of KMLLayer
 * @returns KMLLayer
 */
export const makeKmlLayer = (values: Partial<KMLLayer>): KMLLayer => {
    validateBaseData(values)
    const defaults = {
        uuid: uuidv4(),
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
        linkFiles: new Map(),
    }

    return merge(defaults, values)
}

/**
 * Construct a GPX Layer
 *
 * This is a helper that can work with a subset of the GPXLayer properties. The missing values from
 * the function parameter will be used from defaults
 *
 * @param values Partial values of GPXLayer
 * @returns GPXLayer
 */
export const makeGPXLayer = (values: Partial<GPXLayer>): GPXLayer => {
    validateBaseData(values)
    const isLocalFile = !values.gpxFileUrl?.startsWith('http')
    if (!values.gpxFileUrl) {
        throw new InvalidLayerDataError('Missing GPX file URL', values)
    }
    const attributionName = isLocalFile ? values.gpxFileUrl : new URL(values.gpxFileUrl).hostname
    const attributions = [{ name: attributionName }]
    const name = values.gpxMetadata?.name ?? 'GPX'

    const defaults = {
        uuid: uuidv4(),
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
        timeConfig: null,
    }

    return merge(defaults, values)
}

/**
 * Construct a GeoAdminVectorLayer Layer
 *
 * This is a helper that can work with a subset of the GeoAdminVectorLayer properties. The missing
 * values from the function parameter will be used from defaults
 *
 * @param values Partial values of GeoAdminVectorLayer
 * @returns GeoAdminVectorLayer
 */
export const makeGeoAdminVectorLayer = (
    values: Partial<GeoAdminVectorLayer>
): GeoAdminVectorLayer => {
    validateBaseData(values)
    const attributions = [
        ...(values.attributions ? values.attributions : []),
        { name: 'swisstopo', url: 'https://www.swisstopo.admin.ch/en/home.html' },
    ]

    const defaults = {
        uuid: uuidv4(),
        baseUrl: '',
        type: LayerType.VECTOR,
        technicalName: '',
        attributions,
        name: '',
        id: '',
        opacity: 0,
        visible: false,
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isBackground: true,
        isExternal: false,
        isLoading: false,
        hasError: false,
        hasWarning: false,
        isHighlightable: false,
        timeConfig: null,
        topics: [],
        searchable: false,
        isSpecificFor3d: false
    }

    return merge(defaults, omit(values, 'attributions'))
}

/**
 * Construct a GeoAdmin3DLayer Layer
 *
 * This is a helper that can work with a subset of the GeoAdmin3DLayer properties. The missing
 * values from the function parameter will be used from defaults
 *
 * @param values Partial values of GeoAdmin3DLayer
 * @returns GeoAdmin3DLayer
 */
export const makeGeoAdmin3DLayer = (values: Partial<GeoAdmin3DLayer>): GeoAdmin3DLayer => {
    validateBaseData(values)
    const attributions = [{ name: 'swisstopo', url: 'https://www.swisstopo.admin.ch/en/home.html' }]

    const defaults = {
        uuid: uuidv4(),
        baseUrl: '',
        technicalName: '',
        use3dTileSubFolder: false,
        urlTimestampToUse: false,
        name: values.name ?? values.id ?? '',
        id: '',
        type: LayerType.VECTOR,
        opacity: 1,
        visible: true,
        attributions,
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isExternal: false,
        isLoading: false,
        hasError: false,
        hasWarning: false,
        isHighlightable: false,
        topics: [],
        searchable: false,
        isSpecificFor3d: false,
        timeConfig: null,
    }

    return merge(defaults, values)
}

/**
 * Construct a CloudOptimizedGeoTIFFLayer Layer
 *
 * This is a helper that can work with a subset of the CloudOptimizedGeoTIFFLayer properties. The
 * missing values from the function parameter will be used from defaults
 *
 * @param values Partial values of CloudOptimizedGeoTIFFLayer
 * @returns CloudOptimizedGeoTIFFLayer
 */
export const makeCloudOptimizedGeoTIFFLayer = (
    values: Partial<CloudOptimizedGeoTIFFLayer>
): CloudOptimizedGeoTIFFLayer => {
    validateBaseData(values)
    if (values.fileSource === null || values.fileSource === undefined) {
        throw new InvalidLayerDataError('Missing COG file source', values)
    }

    const fileSource = values.fileSource
    const isLocalFile = !fileSource?.startsWith('http')
    const attributionName = isLocalFile ? fileSource : new URL(fileSource).hostname
    const attributions = [{ name: attributionName }]
    const fileName = isLocalFile
        ? fileSource
        : fileSource?.substring(fileSource.lastIndexOf('/') + 1)

    const defaults = {
        uuid: uuidv4(),
        baseUrl: fileSource,
        type: LayerType.COG,
        isLocalFile,
        fileSource: null,
        data: null,
        noDataValue: null,
        extent: null,
        name: fileName,
        id: fileSource,
        opacity: 1,
        visible: false,
        attributions,
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isExternal: false,
        isLoading: false,
        hasError: false,
        hasWarning: false,
        timeConfig: null,
    }
    return merge(defaults, values)
}

/**
 * Construct a GeoAdminAggregateLayer Layer
 *
 * This is a helper that can work with a subset of the GeoAdminAggregateLayer properties. The
 * missing values from the function parameter will be used from defaults
 *
 * @param values Partial values of GeoAdminAggregateLayer
 * @returns GeoAdminAggregateLayer
 */
export const makeGeoAdminAggregateLayer = (
    values: Partial<GeoAdminAggregateLayer>
): GeoAdminAggregateLayer => {
    validateBaseData(values)
    const defaults = {
        uuid: uuidv4(),
        type: LayerType.AGGREGATE,
        baseUrl: '',
        subLayers: [],
        name: '',
        id: '',
        opacity: 1,
        visible: true,
        attributions: [],
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isExternal: false,
        isLoading: false,
        hasError: false,
        hasWarning: false,
        timeConfig: null,
        isHighlightable: false,
        topics: [],
        searchable: false,
        isSpecificFor3d: false
    }
    return merge(defaults, values)
}

/**
 * Construct a GeoAdminGeoJSONLayer Layer
 *
 * This is a helper that can work with a subset of the GeoAdminGeoJSONLayer properties. The missing
 * values from the function parameter will be used from defaults
 *
 * @param values Partial values of GeoAdminGeoJSONLayer
 * @returns GeoAdminGeoJSONLayer
 */
export const makeGeoAdminGeoJSONLayer = (
    values: Partial<GeoAdminGeoJSONLayer>
): GeoAdminGeoJSONLayer => {
    validateBaseData(values)
    const defaults = {
        uuid: uuidv4(),
        baseUrl: '',
        type: LayerType.GEOJSON,
        updateDelay: 0,
        styleUrl: '',
        geoJsonUrl: '',
        technicalName: '',
        isExternal: false,
        name: '',
        id: '',
        opacity: 1,
        visible: true,
        attributions: [],
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isLoading: false,
        hasError: false,
        hasWarning: false,
        geoJsonStyle: null,
        geoJsonData: null,
        timeConfig: null,
        isHighlightable: false,
        searchable: false,
        topics: [],
        isSpecificFor3d: false
    }

    return merge(defaults, values)
}

/**
 * Construct a GeoAdminGroupOfLayers
 *
 * This is a helper that can work with a subset of the GeoAdminGeoJSONLayer properties. The missing
 * values from the function parameter will be used from defaults
 * @param values Partial values of GeoAdminGroupOfLayers
 * @returns GeoAdminGroupOfLayers
 */
export const makeGeoAdminGroupOfLayers = (values: Partial<GeoAdminGroupOfLayers>): GeoAdminGroupOfLayers => {
    validateBaseData(values)

    const defaults =  {
        uuid: uuidv4(),
        layers: [],
        name: '',
        id: '',
        type: LayerType.GROUP,
        baseUrl: '',
        opacity: 1,
        visible: true,
        attributions: [],
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isExternal: false,
        isLoading: false,
        timeConfig: null,
        hasError: false,
        hasWarning: false
    }

    return merge(defaults, values)
}

/**
 * Construct an aggregate sub layer
 *
 * @param values Partial of AggregateSubLayer
 * @returns AggregateSubLayer
 */
export const makeAggregateSubLayer = (values: Partial<AggregateSubLayer>): AggregateSubLayer => {
    if (values.layer === undefined || values.subLayerId === undefined) {
        throw new InvalidLayerDataError('Must provide a layer for the aggregate sublayer', values)
    }

    const defaults =  {
        minResolution: 0,
        maxResolution: 0
    }

    return merge(defaults, values as AggregateSubLayer)
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
export function getTopicForIdentifyAndTooltipRequests(layer: GeoAdminLayer) {
    // by default, the frontend should always request `ech`, so if there's no topic that's what we do
    // if there are some topics, we look if `ech` is one of them, if so we return it
    if (layer.topics.length === 0 || layer.topics.indexOf('ech') !== -1) {
        return 'ech'
    }
    // otherwise we return the first topic to make our backend requests for identify and htmlPopup
    return layer.topics[0]
}

/**
 * Clone a layer but give it a new uuid
 * @param layer
 * @returns Layer
 */
export function cloneLayer(layer: Layer) {
    const clone = cloneDeep(layer)
    clone.uuid = uuidv4()
    return clone
}
