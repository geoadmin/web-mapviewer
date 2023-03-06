import ElevationProfile from '@/api/profile/ElevationProfile.class'
import ElevationProfilePoint from '@/api/profile/ElevationProfilePoint.class'
import ElevationProfileSegment from '@/api/profile/ElevationProfileSegment.class'
import { API_SERVICE_ALTI_BASE_URL } from '@/config'
import { toLv95 } from '@/modules/drawing/lib/drawingUtils'
import { CoordinateSystems, splitIfOutOfLV95Bounds } from '@/utils/coordinateUtils'
import log from '@/utils/logging'
import { round } from '@/utils/numberUtils'
import axios from 'axios'

function parseProfileFromBackendResponse(backendResponse, startingDist) {
    const points = []
    backendResponse.forEach((rawData) => {
        points.push(
            new ElevationProfilePoint(
                [rawData.easting, rawData.northing],
                startingDist + rawData.dist,
                rawData.alts.COMB
            )
        )
    })
    return new ElevationProfileSegment(points)
}

/**
 * @param {CoordinatesChunk} chunk
 * @param {[Number, Number] | null} startingPoint
 * @param {Number} startingDist
 */
async function getProfileDataForChunk(chunk, startingPoint, startingDist = 0) {
    if (chunk.isWithinLV95Bounds) {
        try {
            const dataForChunk = await axios({
                url: `${API_SERVICE_ALTI_BASE_URL}rest/services/profile.json`,
                method: 'POST',
                params: {
                    offset: 0,
                    sr: CoordinateSystems.LV95.epsgNumber,
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
            if (dataForChunk && dataForChunk.data && dataForChunk.data.length > 2) {
                return parseProfileFromBackendResponse(dataForChunk.data, startingDist)
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
    return new ElevationProfileSegment([
        ...chunk.coordinates?.map((coordinate) => {
            let dist = lastDist
            if (lastCoordinate) {
                dist += Math.sqrt(
                    Math.pow(lastCoordinate[0] - coordinate[0], 2) +
                        Math.pow(lastCoordinate[1] - coordinate[1], 2)
                )
            }
            lastDist = dist
            lastCoordinate = coordinate
            return new ElevationProfilePoint(coordinate, round(dist, 2))
        }),
    ])
}

/**
 * @param {CoordinatesChunk[]} chunks
 * @returns {CoordinatesChunk[]}
 */
function chunksToLV95(chunks) {
    return chunks.map((chunk) => {
        chunk.coordinates = toLv95(chunk.coordinates, CoordinateSystems.WEBMERCATOR.epsg)
        return chunk
    })
}

/**
 * Gets profile from https://api3.geo.admin.ch/services/sdiservices.html#profile
 *
 * @param {[Number, Number][]} coordinates Coordinates in EPSG:3857 (WebMercator) from which we want
 *   the profile
 * @returns {ElevationProfile}
 */
export default async (coordinates) => {
    if (!coordinates || coordinates.length === 0) {
        const errorMessage = `Coordinates not provided`
        log.error(errorMessage)
        throw errorMessage
    }
    const segments = []
    const coordinateChunks = splitIfOutOfLV95Bounds(coordinates)
    if (!coordinateChunks) {
        log.error('No chunks found, no profile data could be fetched')
        return null
    }
    let lastCoordinate = null
    let lastDist = 0
    for (const chunk of chunksToLV95(coordinateChunks)) {
        const segment = await getProfileDataForChunk(chunk, lastCoordinate, lastDist)
        const newSegmentLastPoint = segment.points.slice(-1)[0]
        lastCoordinate = newSegmentLastPoint.coordinate
        lastDist = newSegmentLastPoint.dist
        segments.push(segment)
    }
    return new ElevationProfile(segments)
}
