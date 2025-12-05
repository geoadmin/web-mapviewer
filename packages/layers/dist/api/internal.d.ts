import { Staging } from '@swissgeo/staging-config';
import { GeoAdminLayer } from '../index';
export interface LayerConfigResponse {
    opacity: number;
    type: string;
    background: boolean;
    searchable: boolean;
    tooltip: boolean;
    timeEnabled: boolean;
    highlightable: boolean;
    chargeable: boolean;
    hasLegend: boolean;
    attribution: string;
    attributionUrl?: string;
    config3d?: string;
    topics: string;
    label: string;
    serverLayerName: string;
    timestamps?: string[];
    timeBehaviour?: string;
    singleTile?: boolean;
    wmsUrl?: string;
    wmsLayers?: string;
    gutter?: number;
    format?: 'jpeg' | 'png';
    queryableAttributes?: string[];
    resolutions?: number[];
    geojsonUrl?: string;
    styleUrl?: string;
    updateDelay?: number;
    subLayersIds?: string[];
    minResolution?: number;
    maxResolution?: number;
}
/**
 * Transform the backend metadata JSON object into objects of type {@link GeoAdminLayer}, using the
 * correct specialized type of layer for each entry (see {@link LayerType} and all dedicated
 * specialized types, such as {@link GeoAdminWMSLayer} or {@link GeoAdminWMTSLayer}).
 */
export declare function generateLayerObject(layerConfig: LayerConfigResponse, id: string, allOtherLayers: Record<string, LayerConfigResponse>, lang: string, staging?: Staging): GeoAdminLayer | undefined;
/**
 * Loads the legend (HTML content) for this layer ID
 *
 * @param {String} lang The language in which the legend should be rendered
 * @param {String} layerId The unique layer ID used in our backends
 * @param {Staging} staging
 * @returns {Promise<String>} HTML content of the layer's legend
 */
export declare function getGeoadminLayerDescription(lang: string, layerId: string, staging?: Staging): Promise<string>;
/**
 * Loads the layer config from the backend and transforms it in classes defined in this API file
 *
 * @param {String} lang The ISO code for the lang in which the config should be loaded (required)
 * @param {Staging} staging
 */
export declare function loadGeoadminLayersConfig(lang: string, staging?: Staging): Promise<GeoAdminLayer[]>;
