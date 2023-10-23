import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import proj4 from 'proj4'
import { WEBMERCATOR, WGS84 } from '@/utils/coordinateSystems'

/** File import utils start * */

/**
 * Checks if file has WMS Capabilities XML content
 *
 * @param {string} fileContent
 * @returns {boolean}
 */
export function isWmsGetCap(fileContent) {
    return /<(WMT_MS_Capabilities|WMS_Capabilities)/.test(fileContent)
}

/**
 * Checks if file has WMTS Capabilities XML content
 *
 * @param {string} fileContent
 * @returns {boolean}
 */
export function isWmtsGetCap(fileContent) {
    return /<Capabilities/.test(fileContent)
}

/**
 * Checks if file is KML
 *
 * @param {string} fileContent
 * @returns {boolean}
 */
export function isKml(fileContent) {
    return /<kml/.test(fileContent) && /<\/kml\s*>/.test(fileContent)
}

/**
 * Checks if file is GPX
 *
 * @param {string} fileContent
 * @returns {boolean}
 */
export function isGpx(fileContent) {
    return /<gpx/.test(fileContent) && /<\/gpx\s*>/.test(fileContent)
}

/**
 * Creates WMS or Group layer config from parsed getCap content
 *
 * @param getCap - Object parsed from WMS getCap XML
 * @param layer - Layer item parsed from WMS getCap XML
 * @param visible
 * @param opacity
 * @returns {ExternalGroupOfLayers | undefined | ExternalWMSLayer}
 */
export function getCapWMSLayers(getCap, layer, visible = true, opacity = 1) {
    // If the WMS layer has no name, it can't be displayed
    if (!layer.Name) {
        return undefined
    }
    const wmsUrl = getCap.Capability.Request.GetMap.DCPType[0].HTTP.Get.OnlineResource
    let layerExtent = undefined
    if (layer.BoundingBox?.length) {
        const crs = layer.BoundingBox[0].crs
        const extent = layer.BoundingBox[0].extent
        if (crs === WEBMERCATOR.epsg) {
            layerExtent = [
                [extent[0], extent[1]],
                [extent[2], extent[3]],
            ]
        } else {
            layerExtent = [
                proj4(crs, WEBMERCATOR.epsg, [extent[0], extent[1]]),
                proj4(crs, WEBMERCATOR.epsg, [extent[2], extent[3]]),
            ]
        }
    }

    // Go through the child to get valid layers
    if (layer.Layer?.length) {
        const layers = layer.Layer.map((l) => getCapWMSLayers(getCap, l))
        return new ExternalGroupOfLayers(layer.Title, wmsUrl, layers, layer.Abstract, layerExtent)
    }
    const attribution = layer.Attribution || getCap.Capability.Layer.Attribution || getCap.Service
    return new ExternalWMSLayer(
        layer.Title,
        opacity,
        visible,
        wmsUrl,
        layer.Name,
        [new LayerAttribution(attribution.Title, attribution.OnlineResource)],
        getCap.version,
        'png',
        layer.Abstract,
        layerExtent
    )
}

/**
 * Creates WMTS layer config from parsed getCap content
 *
 * @param getCap - Object parsed from WMTS getCap XML
 * @param layer - Layer item parsed from WMTS getCap XML
 * @param visible
 * @param opacity
 * @returns {ExternalWMTSLayer}
 */
export function getCapWMTSLayers(getCapUrl, getCap, layer, visible = true, opacity = 1) {
    if (!layer.Identifier) {
        return undefined
    }
    let layerExtent = undefined
    if (layer.WGS84BoundingBox?.length) {
        const extent = layer.WGS84BoundingBox
        layerExtent = [
            proj4(WGS84.epsg, WEBMERCATOR.epsg, [extent[0], extent[1]]),
            proj4(WGS84.epsg, WEBMERCATOR.epsg, [extent[2], extent[3]]),
        ]
    }

    return new ExternalWMTSLayer(
        layer.Title,
        opacity,
        visible,
        getCapUrl,
        layer.Identifier,
        getCap.ServiceProvider && [
            new LayerAttribution(
                getCap.ServiceProvider.ProviderName,
                getCap.ServiceProvider.ProviderSite
            ),
        ],
        layer.Abstract,
        layerExtent
    )
}

/** File import utils end * */
