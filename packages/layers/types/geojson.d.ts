import 'geojson'

declare module 'geojson' {
    interface FeatureCollection {
        /**
         * The `crs` property in geoJSON is obsolete and all geoJSONs shoud be in WGS84, In our
         * backend, we still have geoJSON layers which are in LV95 and that have a `crs` property to
         * tell the frontend the base projection.
         */
        crs?: {
            type: 'name'
            properties: {
                name: string
            }
        }
    }
}
