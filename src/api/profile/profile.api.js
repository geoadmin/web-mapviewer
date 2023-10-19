import ElevationProfile from '@/api/profile/ElevationProfile.class'
import ElevationProfilePoint from '@/api/profile/ElevationProfilePoint.class'
import ElevationProfileSegment from '@/api/profile/ElevationProfileSegment.class'
import { API_SERVICE_ALTI_BASE_URL } from '@/config'
import { LV95, WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'
import { round } from '@/utils/numberUtils'
import axios from 'axios'
import proj4 from 'proj4'

function parseProfileFromBackendResponse(backendResponse, startingDist, outputProjection) {
    const points = []
    backendResponse.forEach((rawData) => {
        let coordinates = [rawData.easting, rawData.northing]
        if (outputProjection.epsg !== LV95.epsg) {
            coordinates = proj4(LV95.epsg, outputProjection.epsg, coordinates)
        }
        points.push(
            new ElevationProfilePoint(coordinates, startingDist + rawData.dist, rawData.alts.COMB)
        )
    })
    return new ElevationProfileSegment(points)
}

/**
 * @param {CoordinatesChunk} chunk
 * @param {[Number, Number] | null} startingPoint
 * @param {Number} startingDist
 * @param {CoordinateSystem} outputProjection
 * @returns {ElevationProfile}
 */
async function getProfileDataForChunk(
    chunk,
    startingPoint,
    startingDist = 0,
    outputProjection = WEBMERCATOR
) {
    if (chunk.isWithinBounds) {
        try {
            const dataForChunk = await axios({
                url: `${API_SERVICE_ALTI_BASE_URL}rest/services/profile.json`,
                method: 'POST',
                params: {
                    offset: 0,
                    sr: LV95.epsgNumber,
                    distinct_points: true,
                },
                data: {
                    type: 'LineString',
                    coordinates: chunk.coordinates,
                },
            })
            // checking validity of data from the backend, there is small edge case where we request the backend
            // because the coordinates are technically in bound of LV95, but our backend doesn't cover the last km
            // or so of the LV95 bounds, resulting in an empty profile being sent by the backend even though our
            // coordinates were inbound (hence the dataForChunk.data.length > 2 check)
            if (dataForChunk?.data && dataForChunk.data.length > 2) {
                return parseProfileFromBackendResponse(
                    dataForChunk.data,
                    startingDist,
                    outputProjection
                )
            } else {
                log.error('Incorrect/empty response while getting profile', dataForChunk)
            }
        } catch (err) {
            log.error('Error while trying to fetch profile data', err)
        }
    }
    // returning a chunk without data (and also evaluating distance between point as if we were on a flat plane)
    let lastDist = startingDist
    let lastCoordinate = startingPoint
    if (!chunk?.coordinates) {
        log.error('Malformed chunk', chunk)
        return null
    }
    return new ElevationProfileSegment([
        ...chunk.coordinates.map((coordinate) => {
            let dist = lastDist
            if (lastCoordinate) {
                dist += Math.sqrt(
                    Math.pow(lastCoordinate[0] - coordinate[0], 2) +
                        Math.pow(lastCoordinate[1] - coordinate[1], 2)
                )
            }
            lastDist = dist
            lastCoordinate = coordinate
            return new ElevationProfilePoint(
                coordinate,
                round(dist, outputProjection.acceptableDecimalPoints)
            )
        }),
    ])
}

/**
 * Gets profile from https://api3.geo.admin.ch/services/sdiservices.html#profile
 *
 * @param {[Number, Number][]} coordinates Coordinates, expressed in the given projection, from
 *   which we want the profile
 * @param {CoordinateSystem} projection The projection used to describe the coordinates
 * @returns {ElevationProfile | null} The profile, or null if there was no valid data to produce a
 *   profile
 */
export default async (coordinates, projection = WEBMERCATOR) => {
    if (!coordinates || coordinates.length === 0) {
        const errorMessage = `Coordinates not provided`
        log.error(errorMessage)
        throw errorMessage
    }
    // the service only works with LV95 coordinate, we have to transform them if they are not in this projection
    let coordinatesInLV95 = [...coordinates]
    if (projection.epsg !== LV95.epsg) {
        coordinatesInLV95 = coordinates.map((coordinate) =>
            proj4(projection.epsg, LV95.epsg, coordinate)
        )
    }
    const segments = []
    let coordinateChunks = LV95.bounds.splitIfOutOfBounds(coordinatesInLV95)
    if (!coordinateChunks) {
        log.error('No chunks found, no profile data could be fetched')
        return null
    }
    let lastCoordinate = null
    let lastDist = 0
    for (const chunk of coordinateChunks) {
        const segment = await getProfileDataForChunk(chunk, lastCoordinate, lastDist, projection)
        const newSegmentLastPoint = segment.points.slice(-1)[0]
        lastCoordinate = newSegmentLastPoint.coordinate
        lastDist = newSegmentLastPoint.dist
        segments.push(segment)
    }
    return new ElevationProfile(segments)
}
