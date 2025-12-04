import type { FlatExtent } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'
import type Feature from 'ol/Feature'
import type { Geometry } from 'ol/geom'

import GeoJSON from 'ol/format/GeoJSON'

import type { LayerFeature, SelectableFeature } from '@/api/features/types'

import { extractOlFeatureCoordinates } from '@/api/features'

export default function createLayerFeature(
    olFeature: Feature<Geometry>,
    layer: Layer
): SelectableFeature | undefined {
    const geometry = olFeature.getGeometry()

    if (!geometry) {
        return
    }

    const coordinates = extractOlFeatureCoordinates(olFeature)

    const layerFeature: LayerFeature = {
        layer: layer,
        id: olFeature.getId() ?? olFeature.get('name'),
        title:
            olFeature.get('label') ??
            // exception for MeteoSchweiz GeoJSONs, we use the station name instead of the ID
            // some of their layers are
            // - ch.meteoschweiz.messwerte-niederschlag-10min
            // - ch.meteoschweiz.messwerte-lufttemperatur-10min
            olFeature.get('station_name') ??
            // GPX track feature don't have an ID but have a name !
            olFeature.get('name') ??
            olFeature.getId(),
        data: {
            title: olFeature.get('name'),
            description: olFeature.get('description'),
        },
        coordinates,
        geometry: new GeoJSON().writeGeometryObject(geometry),
        extent: geometry.getExtent() as FlatExtent,
        isEditable: false,
        popupDataCanBeTrusted: false,
    }
    return layerFeature
}
