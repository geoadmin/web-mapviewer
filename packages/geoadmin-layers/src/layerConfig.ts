/* THIS IS TO BE USED TO CONVERT LAYER CONFIG TO LAYERS

Maybe this could serve for some decoupling of the layer config and the actual layers?
*/

import { LayerType, type GeoAdminWMTSLayer } from "@/layers"
import { InvalidLayerDataError } from "@/validation"

// TODO migrate constants?
const DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION = 0.5

const _urlWithTrailingSlash = (baseUrl: string): string => {
  if (baseUrl && !baseUrl.endsWith('/')) {
    return baseUrl + '/'
  }
  return baseUrl;
}

export const createGeoAdminWMTSLayerFromConfig = (layerData: any) => {
      if (!layerData) {
          throw new InvalidLayerDataError('Missing geoadmin WMTS layer data', layerData)
      }
      const {
        // TODO Maybe we don't want these default values? Maybe some of those are mandatory
          name,
          id,
          baseUrl,
          format,
          idIn3d = null,
          technicalName = null,
          opacity = 1.0,
          visible = true,
          attributions = null,
          timeConfig = null,
          isBackground = false,
          isHighlightable = false,
          hasTooltip = false,
          topics = [],
          hasLegend = false,
          searchable = false,
          maxResolution = DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION,
          hasDescription = true
      } = layerData

      // TODO decide where to do this validation
      // if (!constants.SWISSTOPO_TILEGRID_RESOLUTIONS.includes(maxResolution)) {
      //     throw new InvalidLayerDataError(
      //         'max Resolution not part of available resolutions',
      //         layerData
      //     )
      // }

      const wmtsLayer: GeoAdminWMTSLayer = {
          name,
          type: LayerType.WMTS,
          id,
          idIn3d,
          technicalName,
          opacity,
          visible,
          attributions,
          isBackground,
          baseUrl: _urlWithTrailingSlash(baseUrl),
          isHighlightable,
          hasTooltip,
          topics,
          hasLegend,
          searchable,
          timeConfig,
          format,
          maxResolution,
          hasMultipleTimestamps: timeConfig?.timeEntries?.length || false,
          isSpecificFor3d: id.toLowerCase().endsWith('_3d'),
          isExternal: false,
          hasDescription,
          isLoading: false,
          errorMessages: new Set(),
          hasError: false,
      }
    return wmtsLayer
}
