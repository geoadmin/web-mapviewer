import type { FlatExtent } from '@swissgeo/coordinates'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

import { CoordinateSystem, WGS84 } from '@swissgeo/coordinates'
import { styleUtils } from '@swissgeo/theme'
import { gpx as gpxToGeoJSON } from '@tmcw/togeojson'
import { bbox } from '@turf/turf'
import { isEmpty as isExtentEmpty } from 'ol/extent'
import GPX from 'ol/format/GPX'

/**
 * Parse the GPX extent from the GPX tracks or features
 *
 * Will return null if the extent is not parsable.
 *
 * @param content GPX content as a string
 */
export function getGpxExtent(content: string): FlatExtent | undefined {
    const parseGpx = new DOMParser().parseFromString(content, 'text/xml')
    const extent = bbox(gpxToGeoJSON(parseGpx))
    if (isExtentEmpty(extent)) {
        return
    }
    return extent as FlatExtent
}

/**
 * Parses a GPX's data into OL Features, including deserialization of features
 *
 * @param gpxData KML content to parse
 * @param projection Projection to use for the OL Feature
 * @returns List of OL Features, or null of the gpxData or projection is invalid/empty
 */
export function parseGpx(gpxData: string, projection: CoordinateSystem): Feature[] | undefined {
    if (!gpxData?.length || !(projection instanceof CoordinateSystem)) {
        return undefined
    }
    // currently points which contain a timestamp are displayed with an offset due to a bug
    // therefore they are removed here as they are not needed for displaying (see PB-785)
    gpxData = gpxData.replace(/<time>.*?<\/time>/g, '')
    const features: Feature<Geometry>[] = new GPX().readFeatures(gpxData, {
        dataProjection: WGS84.epsg, // GPX files should always be in WGS84
        featureProjection: projection.epsg,
    })
    features.forEach((feature) => {
        const geom = feature.getGeometry()
        if (geom && geom.getType() in styleUtils.gpxStyles) {
            feature.setStyle(styleUtils.gpxStyles[geom.getType()])
        }
    })
    return features
}
