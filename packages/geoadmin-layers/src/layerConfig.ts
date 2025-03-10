/* THIS IS TO BE USED TO CONVERT LAYER CONFIG TO LAYERS

Maybe this could serve for some decoupling of the layer config and the actual layers?
*/

import { LayerType, type GeoAdminAPILayer, type GeoAdminWMTSLayer, type Layer } from "@/layers"
import { InvalidLayerDataError } from "@/validation"

// TODO migrate constants?
const DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION = 0.5

const _urlWithTrailingSlash = (baseUrl: string): string => {
  if (baseUrl && !baseUrl.endsWith('/')) {
    return baseUrl + '/'
  }
  return baseUrl;
}

/**
 * Creating a Layer from the layerConfig
 *
 * This is sort of a replica of the constructor in AbstractLayer
 * I suspect that this could be removed some time if the entire layer
 * thing is refactored
 * @param layerData
 */
const createLayerfromConfig = (layerData: any): Layer => {
  const {
    name,
    id,
    baseUrl,
    type,
    opacity,
    visible,
    hasTooltip,
    attributions,
    hasDescription,
    hasLegend,
    isLoading,
    isExternal,
    timeConfig
  } = layerData

  const layer: Layer = {
    name,
    id,
    baseUrl,
    type,
    opacity,
    visible,
    hasTooltip,
    attributions,
    hasDescription,
    hasLegend,
    isLoading,
    isExternal,
    errorMessages: new Set(),
    hasError: false,
    timeConfig,
    hasMultipleTimestamps: timeConfig?.timeEntries?.length || false,
  }

  return layer;
}


const createGeoAdminAPILayerFromConfig = (layerData: any): GeoAdminAPILayer => {
  const {
    isHighlightable,
    topics,
    format,
    searchable,
    technicalName
  } = layerData

  const baseLayer = createLayerfromConfig(layerData)
  const layer: GeoAdminAPILayer = Object.assign(baseLayer, {
    isHighlightable,
    topics,
    searchable,
    format,
    technicalName,
    isSpecificFor3d: baseLayer.id.toLowerCase().endsWith('_3d'),
    isExternal: false
  })

  return layer
}

export const createGeoAdminWMTSLayerFromConfig = (layerData: any) => {
      if (!layerData) {
          throw new InvalidLayerDataError('Missing geoadmin WMTS layer data', layerData)
      }
      const {
        // TODO Maybe we don't want these default values? Maybe some of those are mandatory
          baseUrl,
          idIn3d = null,
          isBackground,
          maxResolution = DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION,
      } = layerData

      // TODO decide where to do this validation
      // if (!constants.SWISSTOPO_TILEGRID_RESOLUTIONS.includes(maxResolution)) {
      //     throw new InvalidLayerDataError(
      //         'max Resolution not part of available resolutions',
      //         layerData
      //     )
      // }

      const baseLayer = createGeoAdminAPILayerFromConfig(layerData)
      const wmtsLayer: GeoAdminWMTSLayer = Object.assign(baseLayer, {
          type: LayerType.WMTS,
          idIn3d,
          isBackground,
          baseUrl: _urlWithTrailingSlash(baseUrl),
          maxResolution,
    })
    return wmtsLayer
}
