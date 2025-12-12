import type { CoordinateSystem } from '@swissgeo/coordinates'

import { servicesBaseUrl } from '@swissgeo/staging-config'
import { cloneDeep, merge, omit } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import type {
    AggregateSubLayer,
    CloudOptimizedGeoTIFFLayer,
    ExternalWMSLayer,
    ExternalWMTSLayer,
    GeoAdmin3DLayer,
    GeoAdminAggregateLayer,
    GeoAdminGeoJSONLayer,
    GeoAdminGroupOfLayers,
    GeoAdminLayer,
    GeoAdminVectorLayer,
    GeoAdminWMSLayer,
    GeoAdminWMTSLayer,
    GPXLayer,
    KMLLayer,
    Layer,
} from '@/types/layers'

import { DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION } from '@/config'
import { DEFAULT_OPACITY, KMLStyle, LayerType, WMTSEncodingType } from '@/types/layers'
import timeConfigUtils from '@/utils/timeConfigUtils'
import { InvalidLayerDataError } from '@/validation'

export const EMPTY_KML_DATA = '<kml></kml>'

const ENC_PIPE = '%7C'

function transformToLayerTypeEnum(value: string): LayerType | undefined {
    return Object.values(LayerType).includes(value as LayerType) ? (value as LayerType) : undefined
}

/**
 * Encode an external layer parameter.
 *
 * This percent-encodes the special character "|" used to separate external layer parameters.
 *
 * NOTE: We don't use encodeURIComponent here because the Vue Router will anyway do the
 * encodeURIComponent(). By only encoding "|" we avoid encoding other special characters twice. But
 * we need to encode "|" twice to avoid layer-parsing issue.
 */
function encodeExternalLayerParam(param: string): string {
    return param.replace('|', ENC_PIPE)
}

const validateBaseData = (values: Partial<Layer>): void => {
    if (!values.name) {
        throw new InvalidLayerDataError('Missing layer name', values)
    }
    if (!values.id) {
        throw new InvalidLayerDataError('Missing layer ID', values)
    }
}

type DefaultLayerConfig<T> = Omit<T, 'id' | 'name' | 'baseUrl'>

/**
 * Construct a basic GeoAdmin WMS Layer
 *
 * This is a helper that can work with a subset of the GeoAdminWMSLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
function makeGeoAdminWMSLayer(values: Partial<GeoAdminWMSLayer>): GeoAdminWMSLayer {
    const defaults: DefaultLayerConfig<GeoAdminWMSLayer> = {
        uuid: uuidv4(),
        isExternal: false,
        type: LayerType.WMS,
        opacity: DEFAULT_OPACITY,
        isVisible: true,
        isLoading: false,
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
        isBackground: false,
        timeConfig: {
            timeEntries: [],
        },
    }

    const layer = merge(defaults, values)
    validateBaseData(layer)
    return layer as GeoAdminWMSLayer
}

/**
 * Construct a basic GeoAdmin WMTS Layer
 *
 * This is a helper that can work with a subset of the GeoAdminWMTSLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
function makeGeoAdminWMTSLayer(values: Partial<GeoAdminWMTSLayer>): GeoAdminWMTSLayer {
    const defaults: DefaultLayerConfig<GeoAdminWMTSLayer> = {
        uuid: uuidv4(),
        type: LayerType.WMTS,
        idIn3d: undefined,
        technicalName: undefined,
        opacity: 1.0,
        isVisible: true,
        format: 'png' as 'png' | 'jpeg',
        isBackground: false,
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
        timeConfig: { timeEntries: [] },
    }

    const layer = merge(defaults, values)
    validateBaseData(layer)
    return layer as GeoAdminWMTSLayer
}

/**
 * Construct a basic WMTS layer with all the necessary defaults
 *
 * This is a helper that can work with a subset of the GeoAdminWMSLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
function makeExternalWMTSLayer(values: Partial<ExternalWMTSLayer>): ExternalWMTSLayer {
    const hasDescription = (values?.abstract?.length ?? 0) > 0 || (values?.legends?.length ?? 0) > 0
    const attributions = []
    const hasLegend = (values?.legends ?? []).length > 0

    if (values?.baseUrl) {
        attributions.push({ name: new URL(values.baseUrl).hostname })
    }

    const defaults: DefaultLayerConfig<ExternalWMTSLayer> = {
        uuid: uuidv4(),
        isExternal: true,
        type: LayerType.WMTS,
        opacity: DEFAULT_OPACITY,
        isVisible: true,
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
        hasLegend,
        isLoading: true,
        hasError: false,
        currentYear: undefined,
        attributions,
        hasWarning: false,
        timeConfig: {
            timeEntries: [],
        },
    }

    if (values.currentYear && values.timeConfig) {
        const timeEntry = timeConfigUtils.getTimeEntryForYear(values.timeConfig, values.currentYear)
        if (timeEntry) {
            timeConfigUtils.updateCurrentTimeEntry(values.timeConfig, timeEntry)
        }
    }

    // if hasDescription or attributions were provided in `values`, then these would
    // override the ones we inferred above
    const layer = merge(defaults, values)
    validateBaseData(layer)
    return layer as ExternalWMTSLayer
}

/**
 * Construct an external WMSLayer
 *
 * This is a helper that can work with a subset of the WMSLayer properties. The missing values from
 * the function parameter will be used from defaults
 */
function makeExternalWMSLayer(values: Partial<ExternalWMSLayer>): ExternalWMSLayer {
    const hasDescription = (values?.abstract?.length ?? 0) > 0 || (values?.legends?.length ?? 0) > 0
    const attributions = [{ name: new URL(values.baseUrl!).hostname }]
    const hasLegend = (values?.legends ?? []).length > 0

    const defaults: Omit<DefaultLayerConfig<ExternalWMSLayer>, 'wmsOperations'> = {
        uuid: uuidv4(),
        opacity: 1.0,
        isVisible: true,
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
        getFeatureInfoCapability: undefined,
        dimensions: [],
        currentYear: undefined,
        customAttributes: undefined,
        type: LayerType.WMS,
        isExternal: true,
        hasError: false,
        hasWarning: false,
        timeConfig: {
            timeEntries: [],
        },
    }

    if (values.currentYear && values.timeConfig) {
        const timeEntry = timeConfigUtils.getTimeEntryForYear(values.timeConfig, values.currentYear)
        if (timeEntry) {
            timeConfigUtils.updateCurrentTimeEntry(values.timeConfig, timeEntry)
        }
    }

    const layer = merge(defaults, values)
    validateBaseData(layer)
    return layer as ExternalWMSLayer
}

/**
 * Construct a KML Layer
 *
 * This is a helper that can work with a subset of the KMLLayer properties. The missing values from
 * the function parameter will be used from defaults
 */
function makeKMLLayer(values: Partial<KMLLayer>): KMLLayer {
    if (!values.kmlFileUrl) {
        throw new InvalidLayerDataError('Missing KML file URL', values)
    }
    const kmlFileUrl: string = values.kmlFileUrl

    let isExternal: boolean = true
    if (values.isExternal !== undefined) {
        isExternal = values.isExternal
    } else {
        // detecting automatically if the KML file is external or not
        const internalServicesBackends = [
            servicesBaseUrl.kml.development,
            servicesBaseUrl.kml.integration,
            servicesBaseUrl.kml.production,
        ]
        isExternal = !internalServicesBackends.some((internalBackend) =>
            kmlFileUrl.startsWith(internalBackend)
        )
    }
    let clampToGround: boolean
    if (values.clampToGround !== undefined) {
        clampToGround = values.clampToGround
    } else {
        // we clamp to ground our own KML files by default (in 3D viewer)
        clampToGround = !isExternal
    }
    let style: KMLStyle
    if (values.style !== undefined) {
        style = values.style
    } else {
        style = isExternal ? KMLStyle.DEFAULT : KMLStyle.GEOADMIN
    }

    let fileId = values.fileId
    if (!fileId && !isExternal) {
        fileId = kmlFileUrl.split('/').pop()
    }

    const defaults: KMLLayer = {
        kmlFileUrl: '',
        uuid: uuidv4(),
        opacity: 1.0,
        isVisible: true,
        extent: undefined,
        id: `KML|${encodeExternalLayerParam(kmlFileUrl)}`,
        name: 'KML',
        clampToGround,
        isExternal,
        baseUrl: kmlFileUrl,
        fileId,
        kmlData: undefined,
        kmlMetadata: undefined,
        isLocalFile: false,
        attributions: [],
        style,
        type: LayerType.KML,
        hasTooltip: false,
        hasError: false,
        hasWarning: false,
        hasDescription: false,
        hasLegend: false,
        isLoading: true,
        isEdited: false,
        adminId: undefined,
        internalFiles: {},
        timeConfig: {
            timeEntries: [],
        },
    }

    const layer: KMLLayer = merge(defaults, values)
    validateBaseData(layer)
    return layer
}

/**
 * Construct a GPX Layer
 *
 * This is a helper that can work with a subset of the GPXLayer properties. The missing values from
 * the function parameter will be used from defaults
 */
function makeGPXLayer(values: Partial<GPXLayer>): GPXLayer {
    const isLocalFile = !values.gpxFileUrl?.startsWith('http')
    if (!values.gpxFileUrl) {
        throw new InvalidLayerDataError('Missing GPX file URL', values)
    }
    const attributionName = isLocalFile ? values.gpxFileUrl : new URL(values.gpxFileUrl).hostname
    const attributions = [{ name: attributionName }]
    const name = values.gpxMetadata?.name ?? 'GPX'

    const defaults: GPXLayer = {
        uuid: uuidv4(),
        baseUrl: values.gpxFileUrl,
        gpxFileUrl: undefined,
        gpxData: undefined,
        gpxMetadata: undefined,
        extent: undefined,
        name: name,
        id: `GPX|${encodeExternalLayerParam(values.gpxFileUrl)}`,
        type: LayerType.GPX,
        opacity: 0,
        isVisible: false,
        attributions,
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isExternal: true,
        isLocalFile,
        hasError: false,
        hasWarning: false,
        isLoading: !values.gpxData,
        timeConfig: {
            timeEntries: [],
        },
    }

    const layer = merge(defaults, values)
    validateBaseData(layer)
    return layer
}

/**
 * Construct a GeoAdminVectorLayer Layer
 *
 * This is a helper that can work with a subset of the GeoAdminVectorLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
function makeGeoAdminVectorLayer(values: Partial<GeoAdminVectorLayer>): GeoAdminVectorLayer {
    const attributions = [
        ...(values.attributions ? values.attributions : []),
        { name: 'swisstopo', url: 'https://www.swisstopo.admin.ch/en/home.html' },
    ]

    const defaults: DefaultLayerConfig<GeoAdminVectorLayer> = {
        uuid: uuidv4(),
        type: LayerType.VECTOR,
        technicalName: '',
        attributions,
        opacity: 0,
        isVisible: false,
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isBackground: true,
        isExternal: false,
        isLoading: false,
        hasError: false,
        hasWarning: false,
        isHighlightable: false,
        timeConfig: {
            timeEntries: [],
        },
        topics: [],
        searchable: false,
        isSpecificFor3d: false,
    }

    const layer = merge(defaults, omit(values, 'attributions'))
    validateBaseData(layer)
    return layer as GeoAdminVectorLayer
}

/**
 * Construct a GeoAdmin3DLayer Layer
 *
 * This is a helper that can work with a subset of the GeoAdmin3DLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
function makeGeoAdmin3DLayer(values: Partial<GeoAdmin3DLayer>): GeoAdmin3DLayer {
    const attributions = [{ name: 'swisstopo', url: 'https://www.swisstopo.admin.ch/en/home.html' }]

    const defaults: GeoAdmin3DLayer = {
        baseUrl: '',
        id: '',
        uuid: uuidv4(),
        technicalName: '',
        use3dTileSubFolder: false,
        urlTimestampToUse: undefined,
        name: values.name ?? values.id ?? '3D layer',
        type: LayerType.VECTOR,
        opacity: 1,
        isVisible: true,
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
        isBackground: false,
        timeConfig: {
            timeEntries: [],
        },
    }

    const layer = merge(defaults, values)
    validateBaseData(layer)
    return layer
}

/**
 * Construct a CloudOptimizedGeoTIFFLayer Layer
 *
 * This is a helper that can work with a subset of the CloudOptimizedGeoTIFFLayer properties. The
 * missing values from the function parameter will be used from defaults
 */
function makeCloudOptimizedGeoTIFFLayer(
    values: Partial<CloudOptimizedGeoTIFFLayer>
): CloudOptimizedGeoTIFFLayer {
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

    const defaults: CloudOptimizedGeoTIFFLayer = {
        uuid: uuidv4(),
        baseUrl: fileSource,
        type: LayerType.COG,
        isLocalFile,
        fileSource: undefined,
        data: undefined,
        extent: undefined,
        name: fileName,
        id: fileSource,
        opacity: 1,
        isVisible: false,
        attributions,
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isExternal: false,
        isLoading: false,
        hasError: false,
        hasWarning: false,
        timeConfig: {
            timeEntries: [],
        },
    }
    const layer = merge(defaults, values)
    validateBaseData(layer)
    return layer
}

/**
 * Construct a GeoAdminAggregateLayer Layer
 *
 * This is a helper that can work with a subset of the GeoAdminAggregateLayer properties. The
 * missing values from the function parameter will be used from defaults
 */
function makeGeoAdminAggregateLayer(
    values: Partial<GeoAdminAggregateLayer>
): GeoAdminAggregateLayer {
    const defaults: DefaultLayerConfig<GeoAdminAggregateLayer> = {
        uuid: uuidv4(),
        type: LayerType.AGGREGATE,
        subLayers: [],
        opacity: 1,
        isVisible: true,
        attributions: [],
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isExternal: false,
        isLoading: false,
        hasError: false,
        hasWarning: false,
        timeConfig: {
            timeEntries: [],
        },
        isHighlightable: false,
        topics: [],
        searchable: false,
        isSpecificFor3d: false,
        isBackground: false,
    }
    const layer = merge(defaults, values)
    validateBaseData(layer)
    return layer as GeoAdminAggregateLayer
}

/**
 * Construct a GeoAdminGeoJSONLayer Layer
 *
 * This is a helper that can work with a subset of the GeoAdminGeoJSONLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
function makeGeoAdminGeoJSONLayer(values: Partial<GeoAdminGeoJSONLayer>): GeoAdminGeoJSONLayer {
    const defaults: DefaultLayerConfig<GeoAdminGeoJSONLayer> = {
        uuid: uuidv4(),
        type: LayerType.GEOJSON,
        updateDelay: 0,
        styleUrl: '',
        geoJsonUrl: '',
        technicalName: '',
        isExternal: false,
        opacity: 1,
        isVisible: true,
        attributions: [],
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isLoading: false,
        hasError: false,
        hasWarning: false,
        geoJsonStyle: undefined,
        geoJsonData: undefined,
        timeConfig: {
            timeEntries: [],
        },
        isHighlightable: false,
        searchable: false,
        topics: [],
        isSpecificFor3d: false,
        isBackground: false,
    }

    const layer = merge(defaults, values)
    validateBaseData(layer)
    return layer as GeoAdminGeoJSONLayer
}

/**
 * Construct a GeoAdminGroupOfLayers
 *
 * This is a helper that can work with a subset of the GeoAdminGeoJSONLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
function makeGeoAdminGroupOfLayers(values: Partial<GeoAdminGroupOfLayers>): GeoAdminGroupOfLayers {
    const defaults: DefaultLayerConfig<GeoAdminGroupOfLayers> = {
        uuid: uuidv4(),
        layers: [],
        type: LayerType.GROUP,
        opacity: 1,
        isVisible: true,
        attributions: [],
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isExternal: false,
        isLoading: false,
        timeConfig: {
            timeEntries: [],
        },
        hasError: false,
        hasWarning: false,
        isBackground: false,
        isHighlightable: false,
        isSpecificFor3d: false,
        searchable: false,
        topics: [],
    }

    const layer = merge(defaults, values)
    validateBaseData(layer)
    return layer as GeoAdminGroupOfLayers
}

/** Construct an aggregate sub layer */
function makeAggregateSubLayer(values: Partial<AggregateSubLayer>): AggregateSubLayer {
    if (values.layer === undefined || values.subLayerId === undefined) {
        throw new InvalidLayerDataError('Must provide a layer for the aggregate sublayer', values)
    }

    const defaults: Omit<AggregateSubLayer, 'layer'> = {
        minResolution: 0,
        maxResolution: 0,
    }

    return merge(defaults, values as AggregateSubLayer)
}

function isKmlLayerLegacy(layer: KMLLayer): boolean {
    return layer.kmlMetadata?.author !== 'web-mapviewer'
}

function isKmlLayerEmpty(layer: KMLLayer): boolean {
    return !layer.kmlData || layer.kmlData === EMPTY_KML_DATA
}

/**
 * Returns which topic should be used in URL that needs one topic to be defined (identify or
 * htmlPopup for instance). By default and whenever possible, the viewer should use `ech`. If `ech`
 * is not present in the topics, the first of them should be used to request the backend.
 *
 * @returns The topic to use in request to the backend for this layer
 */
function getTopicForIdentifyAndTooltipRequests(layer: Layer): string {
    if (layer.isExternal) {
        return 'ech'
    }
    const geoadminLayer = layer as GeoAdminLayer
    // by default, the frontend should always request `ech`, so if there's no topic that's what we do
    // if there are some topics, we look if `ech` is one of them, if so we return it
    if (geoadminLayer.topics.length === 0 || geoadminLayer.topics.indexOf('ech') !== -1) {
        return 'ech'
    }
    // otherwise we return the first topic to make our backend requests for identify and htmlPopup
    return geoadminLayer.topics[0]!
}

/** Clone a layer but give it a new uuid */
function cloneLayer<T extends Layer>(layer: T, overrides?: Partial<T>): T {
    validateBaseData(layer)
    const clone = cloneDeep(layer)
    clone.uuid = uuidv4()
    if (overrides) {
        Object.assign(clone, overrides)
    }
    return clone
}

/**
 * @param options.addTimestamp Add the timestamp from the time config to the URL. When false, the
 *   timestamp is set to `{Time}` and needs to be processed later (i.e., by the mapping framework).
 */
function getWmtsXyzUrl(
    wmtsLayerConfig: GeoAdminWMTSLayer | ExternalWMTSLayer,
    projection: CoordinateSystem,
    options?: {
        addTimestamp: boolean
        baseUrlOverride?: string
    }
): string | undefined {
    const { addTimestamp = false, baseUrlOverride } = options ?? {}
    if (wmtsLayerConfig?.type === LayerType.WMTS && projection) {
        let timestamp = '{Time}'
        if (addTimestamp) {
            timestamp = timeConfigUtils.getTimestampFromConfig(wmtsLayerConfig) ?? '{Time}'
        }

        let format: string | undefined
        let layerId: string
        if (wmtsLayerConfig.isExternal) {
            const externalLayer = wmtsLayerConfig as ExternalWMTSLayer
            format = externalLayer.options?.format
            layerId = externalLayer.id
        } else {
            const geoadminLayer = wmtsLayerConfig as GeoAdminWMTSLayer
            format = geoadminLayer.format
            layerId = geoadminLayer.technicalName ?? geoadminLayer.id
        }
        return `${baseUrlOverride ?? wmtsLayerConfig.baseUrl}1.0.0/${layerId}/default/${timestamp}/${projection.epsgNumber}/{z}/{x}/{y}.${format ?? 'jpeg'}`
    }
    return
}

export interface GeoadminLayerUtils {
    transformToLayerTypeEnum: typeof transformToLayerTypeEnum
    makeGPXLayer: typeof makeGPXLayer
    makeKMLLayer: typeof makeKMLLayer
    makeGeoAdminWMSLayer: typeof makeGeoAdminWMSLayer
    makeGeoAdminWMTSLayer: typeof makeGeoAdminWMTSLayer
    makeExternalWMTSLayer: typeof makeExternalWMTSLayer
    makeExternalWMSLayer: typeof makeExternalWMSLayer
    makeGeoAdminVectorLayer: typeof makeGeoAdminVectorLayer
    makeGeoAdmin3DLayer: typeof makeGeoAdmin3DLayer
    makeCloudOptimizedGeoTIFFLayer: typeof makeCloudOptimizedGeoTIFFLayer
    makeGeoAdminAggregateLayer: typeof makeGeoAdminAggregateLayer
    makeGeoAdminGeoJSONLayer: typeof makeGeoAdminGeoJSONLayer
    makeGeoAdminGroupOfLayers: typeof makeGeoAdminGroupOfLayers
    makeAggregateSubLayer: typeof makeAggregateSubLayer
    isKmlLayerLegacy: typeof isKmlLayerLegacy
    isKmlLayerEmpty: typeof isKmlLayerEmpty
    getTopicForIdentifyAndTooltipRequests: typeof getTopicForIdentifyAndTooltipRequests
    cloneLayer: typeof cloneLayer
    getWmtsXyzUrl: typeof getWmtsXyzUrl
}

export const layerUtils: GeoadminLayerUtils = {
    transformToLayerTypeEnum,
    makeGPXLayer,
    makeKMLLayer,
    makeGeoAdminWMSLayer,
    makeGeoAdminWMTSLayer,
    makeExternalWMTSLayer,
    makeExternalWMSLayer,
    makeGeoAdminVectorLayer,
    makeGeoAdmin3DLayer,
    makeCloudOptimizedGeoTIFFLayer,
    makeGeoAdminAggregateLayer,
    makeGeoAdminGeoJSONLayer,
    makeGeoAdminGroupOfLayers,
    makeAggregateSubLayer,
    isKmlLayerLegacy,
    isKmlLayerEmpty,
    getTopicForIdentifyAndTooltipRequests,
    cloneLayer,
    getWmtsXyzUrl,
}

export default layerUtils
