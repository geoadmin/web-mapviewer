import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import proj4 from 'proj4'
import allCoordinateSystems, { WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'

/**
 * Creates WMS or Group layer config from parsed getCap content
 *
 * @param getCap - Object parsed from WMS getCap XML
 * @param layer - Layer item parsed from WMS getCap XML
 * @param {CoordinateSystem} projection Projection in which the coordinates of the features should
 *   be expressed
 * @param {boolean} visible
 * @param {number} opacity
 * @returns {ExternalGroupOfLayers | undefined | ExternalWMSLayer}
 */
export function getCapWMSLayers(getCap, layer, projection, visible = true, opacity = 1) {
    // If the WMS layer has no name, it can't be displayed
    let name = layer.Name
    if (!name && layer.Title) {
        // if we don't have a name use the title as name
        name = layer.Title
    }
    if (!name) {
        log.error(`No layer and/or title available`, layer)
        return undefined
    }
    const wmsUrl = getCap.Capability.Request.GetMap.DCPType[0].HTTP.Get.OnlineResource
    let layerExtent = undefined
    if (layer.BoundingBox?.length) {
        const matchedBbox = layer.BoundingBox.find((bbox) => bbox.crs === projection.epsg)
        if (matchedBbox) {
            layerExtent = [
                [matchedBbox.extent[0], matchedBbox.extent[1]],
                [matchedBbox.extent[2], matchedBbox.extent[3]],
            ]
        } else {
            const bbox = layer.BoundingBox.find((bbox) =>
                allCoordinateSystems.find((projection) => projection.epsg === bbox.crs)
            )
            if (bbox) {
                layerExtent = [
                    proj4(bbox.crs, projection.epsg, [bbox.extent[0], bbox.extent[1]]),
                    proj4(bbox.crs, projection.epsg, [bbox.extent[2], bbox.extent[3]]),
                ]
            } else {
                log.error(
                    `No valid bounding box found in GetCapabilities for layer ${name}`,
                    getCap,
                    layer
                )
            }
        }
    }

    // Go through the child to get valid layers
    if (layer.Layer?.length) {
        const layers = layer.Layer.map((l) => getCapWMSLayers(getCap, l, projection))
        return new ExternalGroupOfLayers(layer.Title, wmsUrl, layers, layer.Abstract, layerExtent)
    }
    const attribution = layer.Attribution || getCap.Capability.Layer.Attribution || getCap.Service
    return new ExternalWMSLayer(
        layer.Title,
        opacity,
        visible,
        wmsUrl,
        name,
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
 * @param {CoordinateSystem} projection Projection in which the coordinates of the features should
 *   be expressed
 * @param visible
 * @param opacity
 * @returns {ExternalWMTSLayer}
 */
export function getCapWMTSLayers(
    getCapUrl,
    getCap,
    layer,
    projection,
    visible = true,
    opacity = 1
) {
    if (!layer.Identifier) {
        log.error(`No layer identifier available`, layer)
        return undefined
    }
    let layerExtent = undefined
    if (layer.WGS84BoundingBox?.length) {
        const extent = layer.WGS84BoundingBox
        layerExtent = [
            proj4(WGS84.epsg, projection.epsg, [extent[0], extent[1]]),
            proj4(WGS84.epsg, projection.epsg, [extent[2], extent[3]]),
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
