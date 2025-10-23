import type { Layer } from '@swissgeo/layers'

/**
 * Check if a layer match with the layerId, isExternal, and baseUrl
 *
 * @param layerId ID of the layer to compare
 * @param isExternal If the layer must be external, not, or both (null)
 * @param baseUrl Base URL of the layer(s) to retrieve. If null, accept all
 * @param layerToMatch Layer to compare with
 */
export default function matchTwoLayers(
    layerId: string,
    isExternal?: boolean,
    baseUrl?: string,
    layerToMatch?: Layer
): boolean {
    if (!layerToMatch) {
        return false
    }
    const matchesLayerId = layerToMatch.id === layerId
    const matchesIsExternal = isExternal === undefined || layerToMatch.isExternal === isExternal
    const matchesBaseUrl = baseUrl === undefined || layerToMatch.baseUrl === baseUrl
    return matchesLayerId && matchesIsExternal && matchesBaseUrl
}
