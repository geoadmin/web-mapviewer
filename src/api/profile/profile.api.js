import axios from 'axios'
import proj4 from 'proj4'

import ElevationProfile from '@/api/profile/ElevationProfile.class'
import ElevationProfileSegment from '@/api/profile/ElevationProfileSegment.class'
import { API_SERVICE_ALTI_BASE_URL } from '@/config'
import { LV95 } from '@/utils/coordinates/coordinateSystems'
import { removeZValues, unwrapGeometryCoordinates } from '@/utils/coordinates/coordinateUtils.js'
import log from '@/utils/logging'

export class ProfileError {
    constructor(technicalError, messageKey) {
        this.technicalError = technicalError
        this.messageKey = messageKey
    }
}

/**
 * @typedef ElevationProfilePoint
 * @property {Number} dist Distance from first to current point (relative to the whole profile, not
 *   by segments)
 * @property {[Number, Number]} coordinate Coordinate of this point in the current projection
 * @property {Number | null} elevation In the COMB elevation model
 * @property {Boolean} hasElevationData True if some elevation data are present
 */

/**
 * How many coordinate we will let a chunk have before splitting it into multiple chunks
 *
 * Backend has a hard limit at 5k, we take a conservative approach with 3k.
 *
 * @type {number}
 */
const MAX_CHUNK_LENGTH = 3000

/**
 * @param {CoordinatesChunk[] | null} [chunks]
 * @returns {null | CoordinatesChunk[]}
 */
export function splitIfTooManyPoints(chunks = null) {
    if (!Array.isArray(chunks)) {
        return null
    }
    return chunks.flatMap((chunk) => {
        if (chunk.coordinates.length <= MAX_CHUNK_LENGTH) {
            return chunk
        }
        const subChunks = []
        for (let i = 0; i < chunk.coordinates.length; i += MAX_CHUNK_LENGTH) {
            subChunks.push({
                isWithinBounds: chunk.isWithinBounds,
                coordinates: chunk.coordinates.slice(i, i + MAX_CHUNK_LENGTH),
            })
        }
        return subChunks
    })
}

function parseProfileFromBackendResponse(backendResponse, startingDist, outputProjection) {
    const points = []
    backendResponse.forEach((rawData) => {
        let coordinate = [rawData.easting, rawData.northing]
        if (outputProjection.epsg !== LV95.epsg) {
            coordinate = proj4(LV95.epsg, outputProjection.epsg, coordinate)
        }
        points.push({
            coordinate,
            dist: startingDist + rawData.dist,
            elevation: rawData.alts.COMB,
            hasElevationData: rawData.alts.COMB !== null,
        })
    })
    return new ElevationProfileSegment(points)
}

/**
 * @param {CoordinatesChunk} chunk
 * @param {[Number, Number] | null} startingPoint
 * @param {Number} startingDist
 * @param {CoordinateSystem} outputProjection
 * @returns {Object} Raw profile backend response for this chunk
 * @throws ProfileError
 */
export async function getProfileDataForChunk(chunk, startingPoint, startingDist, outputProjection) {
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
                return dataForChunk.data
            } else {
                log.error('Incorrect/empty response while getting profile', dataForChunk)
                throw new ProfileError(
                    'Incorrect/empty response while getting profile',
                    'network_error'
                )
            }
        } catch (err) {
            if (
                err.response &&
                err.response.status === 413 &&
                err.response.data.error?.message?.includes(
                    'Request Geometry contains too many points. Maximum number of points allowed'
                )
            ) {
                log.error(
                    'Requesting too many points for a profile, request could not be processed',
                    err
                )
                throw new ProfileError(
                    'Error requesting profile with too many points',
                    'profile_too_many_points_error'
                )
            }

            log.error('Error while trying to fetch profile data', err)
            if (err instanceof ProfileError) {
                throw err
            }
            throw new ProfileError('Error while trying to fetch profile data', 'network_error')
        }
    }
    // returning a chunk without data (and also evaluating distance between point as if we were on a flat plane)
    let lastDist = startingDist
    let lastCoordinate = startingPoint
    if (!chunk?.coordinates) {
        log.error('Malformed chunk', chunk)
        throw new ProfileError('Malformed chunk', 'network_error')
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
            return {
                coordinate,
                dist: outputProjection.roundCoordinateValue(dist),
                elevation: null,
                hasElevationData: false,
            }
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
 * @throws ProfileError
 */
export default async (coordinates, projection) => {
    if (!coordinates || coordinates.length === 0) {
        const errorMessage = `Coordinates not provided`
        log.error(errorMessage)
        throw new ProfileError(errorMessage, 'could_not_generate_profile')
    }
    // the service only works with LV95 coordinate, we have to transform them if they are not in this projection
    // removing any 3d dimension that could come from OL
    let coordinatesInLV95 = removeZValues(unwrapGeometryCoordinates(coordinates))
    if (projection.epsg !== LV95.epsg) {
        coordinatesInLV95 = coordinates.map((coordinate) =>
            proj4(projection.epsg, LV95.epsg, coordinate)
        )
    }
    const segments = []
    let coordinateChunks = splitIfTooManyPoints(LV95.bounds.splitIfOutOfBounds(coordinatesInLV95))
    if (!coordinateChunks) {
        log.error('No chunks found, no profile data could be fetched', coordinatesInLV95)
        throw new ProfileError(
            'No chunks found, no profile data could be fetched',
            'could_not_generate_profile'
        )
    }
    let lastCoordinate = null
    let lastDist = 0
    const requestsForChunks = coordinateChunks.map((chunk) =>
        getProfileDataForChunk(chunk, lastCoordinate, lastDist, projection)
    )
    for (const chunkResponse of await Promise.allSettled(requestsForChunks)) {
        if (chunkResponse.status === 'fulfilled') {
            const segment = parseProfileFromBackendResponse(
                chunkResponse.value,
                lastDist,
                projection
            )
            if (segment) {
                const newSegmentLastPoint = segment.points.slice(-1)[0]
                lastCoordinate = newSegmentLastPoint.coordinate
                lastDist = newSegmentLastPoint.dist
                segments.push(segment)
            }
        } else {
            log.error('Error while getting profile for chunk', chunkResponse.reason?.message)
        }
    }
    return new ElevationProfile(segments)
}
