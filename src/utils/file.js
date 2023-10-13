import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'

/** File import utils start **/

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
 * @returns {ExternalGroupOfLayers|undefined|ExternalWMSLayer}
 */
export function getCapWMSLayers(getCap, layer, visible = true, opacity = 1) {
    // If the WMS layer has no name, it can't be displayed
    if (!layer.Name) {
        return undefined
    }
    const wmsUrl = getCap.Capability.Request.GetMap.DCPType[0].HTTP.Get.OnlineResource

    // Go through the child to get valid layers
    if (layer.Layer?.length) {
        const layers = layer.Layer.map((l) => getCapWMSLayers(getCap, l))
        return new ExternalGroupOfLayers(layer.Title, wmsUrl, layers)
    }
    const attribution = layer.Attribution || getCap.Capability.Layer.Attribution
    return new ExternalWMSLayer(
        layer.Title,
        opacity,
        visible,
        wmsUrl,
        layer.Name,
        [new LayerAttribution(attribution.Title, attribution.OnlineResource)],
        getCap.version
    )
}

/**
 * Creates WMTS layer config from parsed getCap content
 *
 * @param getCap - Object parsed from WMTS getCap XML
 * @param layer - Layer item parsed from WMTS getCap XML
 * @param visible
 * @param opacity
 * @returns {ExternalGroupOfLayers|undefined|ExternalWMSLayer}
 */
export function getCapWMTSLayers(getCapUrl, getCap, layer, visible = true, opacity = 1) {
    if (!layer.Identifier) {
        return undefined
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
        ]
    )
}

/** File import utils end **/
