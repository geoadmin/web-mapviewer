import type { FeatureCollection } from 'geojson'

/**
 * The `crs` property in geoJSON is obsolete and all geoJSONs shoud be in WGS84,
 * In our backend, we still have geoJSON layers which are in LV95 and that have a
 * `crs` property to tell the frontend the base projection.
 *
 */
export interface FeatureCollectionWithCRS extends FeatureCollection {
    crs?: {
        type: "name",
        properties: {
            name: string
        }
    }
}
