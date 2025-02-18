import type { CoordinatesChunk, CoordinateSystem, SingleCoordinate } from '@geoadmin/coordinates'

import { LV95, removeZValues } from '@geoadmin/coordinates'
import { log } from '@geoadmin/log'
import axios from 'axios'
import proj4 from 'proj4'

import { SERVICE_ALTI_BASE_URL } from '@/config'
import getProfileMetadata, { type ElevationProfileMetadata } from '@/utils'

export class ElevationProfileError extends Error {
    public readonly technicalError: Error

    constructor(message: string, technicalError: Error) {
        super(message)
        this.technicalError = technicalError
    }
}

type ServiceProfileAltitudes = {
    COMB?: number
    DTM2?: number
    DTM25?: number
}

type ServiceProfilePoints = {
    alts?: ServiceProfileAltitudes
    dist: number
    easting: number
    northing: number
}

export interface ElevationProfilePoint {
    /** Distance from first to current point (relative to the whole profile, not by segments) */
    dist?: number
    coordinate: SingleCoordinate
    /** Expressed in the COMB elevation model */
    elevation?: number
    hasElevationData: boolean
}

export type ElevationProfileSegment = {
    points: ElevationProfilePoint[]
    hasElevationData: boolean
    hasDistanceData: boolean
}

export type ElevationProfile = {
    segments: ElevationProfileSegment[]
    metadata: ElevationProfileMetadata
}

/**
 * How many coordinate we will let a chunk have before splitting it into multiple chunks
 *
 * Backend has a hard limit at 5k, we take a conservative approach with 3k.
 */
const MAX_CHUNK_LENGTH: number = 3000

export function splitIfTooManyPoints(chunk: CoordinatesChunk): CoordinatesChunk[] | null {
    if (!chunk) {
        return null
    }
    if (chunk.coordinates.length <= MAX_CHUNK_LENGTH) {
        return [chunk]
    }
    const subChunks = []
    for (let i = 0; i < chunk.coordinates.length; i += MAX_CHUNK_LENGTH) {
        subChunks.push({
            isWithinBounds: chunk.isWithinBounds,
            coordinates: chunk.coordinates.slice(i, i + MAX_CHUNK_LENGTH),
        })
    }
    return subChunks
}

function parseProfileSegmentFromBackendResponse(
    backendResponse: Awaited<ServiceProfilePoints[]>,
    startingDist: number,
    outputProjection: CoordinateSystem
): ElevationProfileSegment {
    const points: ElevationProfilePoint[] = backendResponse.map((rawPoint) => {
        let coordinate: SingleCoordinate = [rawPoint.easting, rawPoint.northing]
        if (outputProjection.epsg !== LV95.epsg) {
            coordinate = proj4(LV95.epsg, outputProjection.epsg, coordinate)
        }
        const point: ElevationProfilePoint = {
            coordinate,
            dist: startingDist + (rawPoint.dist ?? 0),
            elevation: rawPoint.alts?.COMB,
            hasElevationData: rawPoint.alts?.COMB !== undefined,
        }
        return point
    })
    return {
        hasElevationData: points.every((point) => point.hasElevationData),
        hasDistanceData: points.some((point) => (point.dist ?? 0) > 0),
        points,
    }
}

/** @throws ElevationProfileError */
export async function getProfileDataForChunk(
    chunk: CoordinatesChunk,
    startingPoint: SingleCoordinate | null = null,
    startingDist: number,
    outputProjection: CoordinateSystem
): Promise<ServiceProfilePoints[]> {
    if (chunk.isWithinBounds) {
        try {
            // our backend has a hard limit of 5k points, we split the coordinates if they are above 3k
            // (after a couple tests, 3k was a good trade-off for performance, 5k was a bit sluggish)
            const coordinatesToRequest: CoordinatesChunk[] | null = splitIfTooManyPoints(chunk)
            if (coordinatesToRequest === null) {
                return []
            }

            const allRequests = coordinatesToRequest
                .filter((coordinateChunk) => coordinateChunk !== null)
                .map((coordinatesChunk) => {
                    return axios({
                        url: `${SERVICE_ALTI_BASE_URL}rest/services/profile.json`,
                        method: 'POST',
                        params: {
                            offset: 0,
                            sr: LV95.epsgNumber,
                            distinct_points: true,
                        },
                        data: {
                            type: 'LineString',
                            coordinates: coordinatesChunk.coordinates,
                        },
                    })
                })

            const allResponses = await Promise.all(allRequests)
            const finalResponse: ServiceProfilePoints[] = []
            let previousDist = 0
            // stitching all responses back together, so that the rest of the app is unaware we've cut the coordinates
            // in 3k points chunks.
            allResponses.forEach((response) => {
                // checking the validity of data from the backend, there is a small edge case where we request the backend
                // because the coordinates are technically in bound of LV95, but our backend doesn't cover the last km
                // or so of the LV95 bounds, resulting in an empty profile being sent by the backend even though our
                // coordinates were inbound (hence the dataForChunk.data.length > 2 check)
                if (response.data?.length > 2) {
                    finalResponse.push(
                        ...response.data.map((point: ServiceProfilePoints) => ({
                            ...point,
                            dist: point.dist + previousDist,
                        }))
                    )
                    previousDist = response.data.slice(-1)[0].dist ?? 0
                } else {
                    log.error('Incorrect/empty response while getting profile', response)
                    throw new ElevationProfileError(
                        'Incorrect/empty response while getting profile',
                        new Error('profile_network_error')
                    )
                }
            })
            return finalResponse
        } catch (err: any) {
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
                throw new ElevationProfileError(
                    'Error requesting profile with too many points',
                    new Error('profile_too_many_points_error')
                )
            }

            log.error('Error while trying to fetch profile data', err)
            if (err instanceof ElevationProfileError) {
                throw err
            }
            throw new ElevationProfileError(
                'Error while trying to fetch profile data',
                new Error('profile_network_error')
            )
        }
    }
    // returning a chunk without data (and also evaluating distance between point as if we were on a flat plane)
    let lastDist = startingDist
    let lastCoordinate = startingPoint
    if (!chunk?.coordinates) {
        log.error('Malformed chunk', chunk)
        throw new ElevationProfileError('Malformed chunk', new Error('profile_network_error'))
    }
    return [
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
            const point: ServiceProfilePoints = {
                easting: coordinate[0],
                northing: coordinate[1],
                dist: outputProjection.roundCoordinateValue(dist),
                alts: undefined,
            }
            return point
        }),
    ]
}

function ensureDoubleNestedArray(
    arr: SingleCoordinate[] | SingleCoordinate[][]
): SingleCoordinate[][] {
    if (Array.isArray(arr) && Array.isArray(arr[0]) && Array.isArray(arr[0][0])) {
        if (typeof arr[0][0] !== 'number') {
            throw new ElevationProfileError(
                'Received a multi-feature (MultiLineString or MultiPolygon). This is not supported bt this component, you need to split the feature and give each element of the "multi"-feature separately.',
                new Error('profile_could_not_generate')
            )
        }
        return arr as SingleCoordinate[][]
    }
    return [arr] as SingleCoordinate[][]
}

/**
 * Gets profile from https://api3.geo.admin.ch/services/sdiservices.html#profile
 *
 * @param profileCoordinates Coordinates, expressed in the given projection, from which we want the
 *   profile
 * @param projection The projection used to describe the coordinates
 * @returns The profile, or null if there was no valid data to produce a profile
 * @throws ElevationProfileError will reject the promise with a ProfileError if something went
 *   wrong.
 */
export default async (
    profileCoordinates: SingleCoordinate[] | SingleCoordinate[][],
    projection: CoordinateSystem
): Promise<ElevationProfile> => {
    if (!profileCoordinates || profileCoordinates.length === 0) {
        const errorMessage = `Coordinates not provided`
        log.error(errorMessage)
        throw new ElevationProfileError(errorMessage, new Error('profile_could_not_generate'))
    }
    const segments: ElevationProfileSegment[] = []
    // if the profileCoordinates is not a double nested array, we make it one
    // segmented files have a double nested array, but not all files or self made drawings
    // so we have to make sure we have a double nested array and then iterate over it
    const coordinatesForSegments: SingleCoordinate[][] = ensureDoubleNestedArray(profileCoordinates)

    for (const coordinates of coordinatesForSegments) {
        // The service only works with LV95 coordinate, we have to transform them if they are not in this projection
        // removing any 3d dimension that could come from OL
        let coordinatesInLV95: SingleCoordinate[] = removeZValues(coordinates)
        if (projection.epsg !== LV95.epsg) {
            coordinatesInLV95 = coordinatesInLV95.map((coordinate) =>
                proj4(projection.epsg, LV95.epsg, coordinate)
            )
        }

        // splitting the profile input into "segment" if some part are out of LV95 bounds
        // as there will be no data for those segments.
        const coordinateChunks: CoordinatesChunk[] | null =
            LV95.bounds.splitIfOutOfBounds(coordinatesInLV95)

        if (!coordinateChunks) {
            log.error(
                '[Profile] No data found within LV95 bounds, no profile data could be fetched',
                coordinatesInLV95
            )
            throw new ElevationProfileError(
                'No data found within LV95 bounds, no profile data could be fetched',
                new Error('profile_could_not_generate')
            )
        }
        if (coordinateChunks.some((chunk) => !chunk.isWithinBounds)) {
            log.warn('[Profile] Some parts of the profile are out of LV95 bounds')
        }
        let lastCoordinate: SingleCoordinate | null = null
        let lastDist: number = 0
        const requestsForChunks: Promise<ServiceProfilePoints[]>[] = coordinateChunks.map((chunk) =>
            getProfileDataForChunk(chunk, lastCoordinate, lastDist, projection)
        )
        for (const chunkResponse of await Promise.allSettled(requestsForChunks)) {
            if (chunkResponse.status === 'fulfilled') {
                const segment: ElevationProfileSegment = parseProfileSegmentFromBackendResponse(
                    chunkResponse.value,
                    lastDist,
                    projection
                )
                if (segment) {
                    const newSegmentLastPoint = segment.points.slice(-1)[0]
                    lastCoordinate = newSegmentLastPoint.coordinate
                    lastDist = newSegmentLastPoint.dist ?? 0
                    segments.push(segment)
                }
            } else {
                log.error(
                    '[Profile] Error while getting profile for chunk',
                    chunkResponse.reason?.message
                )
            }
        }
    }
    return {
        segments,
        metadata: getProfileMetadata(
            segments
                .flatMap((segment) => segment.points)
                .toSorted((p1, p2) => (p1.dist ?? 0) - (p2.dist ?? 0))
        ),
    }
}
