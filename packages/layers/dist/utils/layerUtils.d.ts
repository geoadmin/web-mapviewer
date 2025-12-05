import { CoordinateSystem } from '@swissgeo/coordinates';
import { AggregateSubLayer, CloudOptimizedGeoTIFFLayer, ExternalWMSLayer, ExternalWMTSLayer, GeoAdmin3DLayer, GeoAdminAggregateLayer, GeoAdminGeoJSONLayer, GeoAdminGroupOfLayers, GeoAdminVectorLayer, GeoAdminWMSLayer, GeoAdminWMTSLayer, GPXLayer, KMLLayer, Layer, LayerType } from '../types/layers';
export declare const EMPTY_KML_DATA = "<kml></kml>";
declare function transformToLayerTypeEnum(value: string): LayerType | undefined;
/**
 * Construct a basic GeoAdmin WMS Layer
 *
 * This is a helper that can work with a subset of the GeoAdminWMSLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
declare function makeGeoAdminWMSLayer(values: Partial<GeoAdminWMSLayer>): GeoAdminWMSLayer;
/**
 * Construct a basic GeoAdmin WMTS Layer
 *
 * This is a helper that can work with a subset of the GeoAdminWMTSLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
declare function makeGeoAdminWMTSLayer(values: Partial<GeoAdminWMTSLayer>): GeoAdminWMTSLayer;
/**
 * Construct a basic WMTS layer with all the necessary defaults
 *
 * This is a helper that can work with a subset of the GeoAdminWMSLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
declare function makeExternalWMTSLayer(values: Partial<ExternalWMTSLayer>): ExternalWMTSLayer;
/**
 * Construct an external WMSLayer
 *
 * This is a helper that can work with a subset of the WMSLayer properties. The missing values from
 * the function parameter will be used from defaults
 */
declare function makeExternalWMSLayer(values: Partial<ExternalWMSLayer>): ExternalWMSLayer;
/**
 * Construct a KML Layer
 *
 * This is a helper that can work with a subset of the KMLLayer properties. The missing values from
 * the function parameter will be used from defaults
 */
declare function makeKMLLayer(values: Partial<KMLLayer>): KMLLayer;
/**
 * Construct a GPX Layer
 *
 * This is a helper that can work with a subset of the GPXLayer properties. The missing values from
 * the function parameter will be used from defaults
 */
declare function makeGPXLayer(values: Partial<GPXLayer>): GPXLayer;
/**
 * Construct a GeoAdminVectorLayer Layer
 *
 * This is a helper that can work with a subset of the GeoAdminVectorLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
declare function makeGeoAdminVectorLayer(values: Partial<GeoAdminVectorLayer>): GeoAdminVectorLayer;
/**
 * Construct a GeoAdmin3DLayer Layer
 *
 * This is a helper that can work with a subset of the GeoAdmin3DLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
declare function makeGeoAdmin3DLayer(values: Partial<GeoAdmin3DLayer>): GeoAdmin3DLayer;
/**
 * Construct a CloudOptimizedGeoTIFFLayer Layer
 *
 * This is a helper that can work with a subset of the CloudOptimizedGeoTIFFLayer properties. The
 * missing values from the function parameter will be used from defaults
 */
declare function makeCloudOptimizedGeoTIFFLayer(values: Partial<CloudOptimizedGeoTIFFLayer>): CloudOptimizedGeoTIFFLayer;
/**
 * Construct a GeoAdminAggregateLayer Layer
 *
 * This is a helper that can work with a subset of the GeoAdminAggregateLayer properties. The
 * missing values from the function parameter will be used from defaults
 */
declare function makeGeoAdminAggregateLayer(values: Partial<GeoAdminAggregateLayer>): GeoAdminAggregateLayer;
/**
 * Construct a GeoAdminGeoJSONLayer Layer
 *
 * This is a helper that can work with a subset of the GeoAdminGeoJSONLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
declare function makeGeoAdminGeoJSONLayer(values: Partial<GeoAdminGeoJSONLayer>): GeoAdminGeoJSONLayer;
/**
 * Construct a GeoAdminGroupOfLayers
 *
 * This is a helper that can work with a subset of the GeoAdminGeoJSONLayer properties. The missing
 * values from the function parameter will be used from defaults
 */
declare function makeGeoAdminGroupOfLayers(values: Partial<GeoAdminGroupOfLayers>): GeoAdminGroupOfLayers;
/** Construct an aggregate sub layer */
declare function makeAggregateSubLayer(values: Partial<AggregateSubLayer>): AggregateSubLayer;
declare function isKmlLayerLegacy(layer: KMLLayer): boolean;
declare function isKmlLayerEmpty(layer: KMLLayer): boolean;
/**
 * Returns which topic should be used in URL that needs one topic to be defined (identify or
 * htmlPopup for instance). By default and whenever possible, the viewer should use `ech`. If `ech`
 * is not present in the topics, the first of them should be used to request the backend.
 *
 * @returns The topic to use in request to the backend for this layer
 */
declare function getTopicForIdentifyAndTooltipRequests(layer: Layer): string;
/** Clone a layer but give it a new uuid */
declare function cloneLayer<T extends Layer>(layer: T): T;
/**
 * @param options.addTimestamp Add the timestamp from the time config to the URL. When false, the
 *   timestamp is set to `{Time}` and needs to be processed later (i.e., by the mapping framework).
 */
export declare function getWmtsXyzUrl(wmtsLayerConfig: GeoAdminWMTSLayer | ExternalWMTSLayer, projection: CoordinateSystem, options?: {
    addTimestamp: boolean;
    baseUrlOverride?: string;
}): string | undefined;
export interface GeoadminLayerUtils {
    transformToLayerTypeEnum: typeof transformToLayerTypeEnum;
    makeGPXLayer: typeof makeGPXLayer;
    makeKMLLayer: typeof makeKMLLayer;
    makeGeoAdminWMSLayer: typeof makeGeoAdminWMSLayer;
    makeGeoAdminWMTSLayer: typeof makeGeoAdminWMTSLayer;
    makeExternalWMTSLayer: typeof makeExternalWMTSLayer;
    makeExternalWMSLayer: typeof makeExternalWMSLayer;
    makeGeoAdminVectorLayer: typeof makeGeoAdminVectorLayer;
    makeGeoAdmin3DLayer: typeof makeGeoAdmin3DLayer;
    makeCloudOptimizedGeoTIFFLayer: typeof makeCloudOptimizedGeoTIFFLayer;
    makeGeoAdminAggregateLayer: typeof makeGeoAdminAggregateLayer;
    makeGeoAdminGeoJSONLayer: typeof makeGeoAdminGeoJSONLayer;
    makeGeoAdminGroupOfLayers: typeof makeGeoAdminGroupOfLayers;
    makeAggregateSubLayer: typeof makeAggregateSubLayer;
    isKmlLayerLegacy: typeof isKmlLayerLegacy;
    isKmlLayerEmpty: typeof isKmlLayerEmpty;
    getTopicForIdentifyAndTooltipRequests: typeof getTopicForIdentifyAndTooltipRequests;
    cloneLayer: typeof cloneLayer;
    getWmtsXyzUrl: typeof getWmtsXyzUrl;
}
export declare const layerUtils: GeoadminLayerUtils;
export default layerUtils;
