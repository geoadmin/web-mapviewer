import { format } from '@geoadmin/numbers'

import type { ElevationProfilePoint } from '@/profile.api'

export interface ElevationProfileMetadata {
    totalLinearDist: number
    minElevation: number
    maxElevation: number
    elevationDifference: number
    totalAscent: number
    totalDescent: number
    /** Sum of slope/surface distances (distance on the ground) */
    slopeDistance: number
    /**
     * Hiking time calculation for the profile in minutes.
     *
     * Official formula: http://www.wandern.ch/download.php?id=4574_62003b89 Reference link:
     * http://www.wandern.ch
     *
     * But we use a slightly modified version from Schweizmobil
     */
    hikingTime: number
    hasElevationData: boolean
    hasDistanceData: boolean
}

function totalLinearDist(points: ElevationProfilePoint[]): number {
    return points.filter((point) => point.dist !== undefined).pop()?.dist ?? 0
}

function maxElevation(points: ElevationProfilePoint[]): number {
    if (points.every((point) => !point.elevation)) {
        return 0
    }
    return points.reduce((acc, point) => Math.max(acc, point.elevation ?? -Infinity), -Infinity)
}

function minElevation(points: ElevationProfilePoint[]): number {
    if (points.every((point) => !point.elevation)) {
        return 0
    }
    return points.reduce((acc, point) => Math.min(acc, point.elevation ?? Infinity), Infinity)
}

/** @returns Elevation difference between starting and ending point, in meters */
function elevationDifference(points: ElevationProfilePoint[]): number {
    if (points.every((point) => !point.elevation)) {
        return 0
    }
    const firstPointWithElevationData = points.find((point) => point.elevation !== undefined)
    const lastPointWithElevationData = points
        .toReversed()
        .find((point) => point.elevation !== undefined)
    return (
        (lastPointWithElevationData?.elevation ?? 0) - (firstPointWithElevationData?.elevation ?? 0)
    )
}

function totalAscent(points: ElevationProfilePoint[]): number {
    if (points.every((point) => !point.elevation)) {
        return 0
    }
    return points.reduce((totalAscent, currentPoint, currentIndex, points) => {
        if (currentIndex === 0) {
            // we skip the first element, as we can't calculate the ascent with only one point
            return totalAscent
        }
        // we only want positive ascent value, so if it's a descent we return 0
        return (
            totalAscent +
            Math.max((currentPoint.elevation ?? 0) - (points[currentIndex - 1].elevation ?? 0), 0)
        )
    }, 0)
}

function totalDescent(points: ElevationProfilePoint[]) {
    if (points.every((point) => !point.elevation)) {
        return 0
    }
    return Math.abs(
        points.reduce((totalDescent, currentPoint, currentIndex, points) => {
            if (currentIndex === 0) {
                // we skip the first element, as we can't calculate the descent with only one point
                return totalDescent
            }
            // we only want descent value, so if it's an ascent we return 0
            return (
                totalDescent -
                Math.min(
                    (currentPoint.elevation ?? 0) - (points[currentIndex - 1].elevation ?? 0),
                    0
                )
            )
        }, 0)
    )
}

/** @returns Sum of slope/surface distances (distance on the ground) */
function slopeDistance(points: ElevationProfilePoint[]): number {
    if (points.every((point) => !point.elevation)) {
        return 0
    }
    return points.reduce((sumSlopeDist, currentPoint, currentIndex, points) => {
        if (currentIndex === 0) {
            // we skip the first element, as we can't calculate slope/distance with only one point
            return sumSlopeDist
        }
        const previousPoint = points[currentIndex - 1]
        const elevationDelta = (currentPoint.elevation ?? 0) - (previousPoint.elevation ?? 0)
        const distanceDelta = (currentPoint.dist ?? 0) - (previousPoint.dist ?? 0)
        // Pythagorean theorem (hypotenuse: the slope/surface distance)
        return sumSlopeDist + Math.sqrt(Math.pow(elevationDelta, 2) + Math.pow(distanceDelta, 2))
    }, 0)
}

function hikingTime(points: ElevationProfilePoint[]): number {
    if (points.every((point) => !point.elevation)) {
        return 0
    }

    // Constants of the formula (Schweizmobil)
    const arrConstants = [
        14.271, 3.6991, 2.5922, -1.4384, 0.32105, 0.81542, -0.090261, -0.20757, 0.010192, 0.028588,
        -0.00057466, -0.0021842, 1.5176e-5, 8.6894e-5, -1.3584e-7, -1.4026e-6,
    ]

    return Math.round(
        points
            .toSorted((p1, p2) => (p1.dist ?? 0) - (p2.dist ?? 0))
            .map((currentPoint, index, points) => {
                if (index < points.length - 2) {
                    const nextPoint = points[index + 1]

                    const distanceDelta = (nextPoint.dist ?? 0) - (currentPoint.dist ?? 0)
                    if (!distanceDelta) {
                        return 0
                    }
                    const elevationDelta =
                        (nextPoint.elevation ?? 0) - (currentPoint.elevation ?? 0)

                    // Slope value between the 2 points
                    // 10ths (Schweizmobil formula) instead of % (official formula)
                    const slope = (elevationDelta * 10.0) / distanceDelta

                    // The swiss hiking formula is used between -25% and +25%
                    // but Schweizmobil use -40% and +40%
                    let minutesPerKilometer = 0
                    if (slope > -4 && slope < 4) {
                        arrConstants.forEach((constants, i) => {
                            minutesPerKilometer += constants * Math.pow(slope, i)
                        })
                        // outside the -40% to +40% range, we use a linear formula
                    } else if (slope > 0) {
                        minutesPerKilometer = 17 * slope
                    } else {
                        minutesPerKilometer = -9 * slope
                    }
                    return (distanceDelta * minutesPerKilometer) / 1000
                }
                return 0
            })
            .reduce((a, b) => a + b)
    )
}

/**
 * Formats minutes to hours and minutes (if more than one hour) e.g. 1230 -> '20h 30min', 55 ->
 * '55min'
 *
 * @returns Time in 'Hh Mmin'
 */
export function formatMinutesTime(minutes?: number): string {
    if (!minutes || isNaN(minutes)) {
        return '-'
    }
    let result = ''
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60)
        minutes = minutes - hours * 60
        result += `${hours}h`
        if (minutes > 0) {
            result += ` ${minutes}min`
        }
    } else {
        result += `${minutes}min`
    }
    return result
}

export function formatDistance(value?: number) {
    if (!value || isNaN(value)) {
        return '0.00m'
    }
    if (value < 1000) {
        return `${value.toFixed(2)}m`
    }
    return `${(value / 1000).toFixed(2)}km`
}

export function formatElevation(value?: number) {
    if (!value || isNaN(value)) {
        return '0.00m'
    }
    if (value < 1000) {
        return `${value.toFixed(2)}m`
    }
    return `${format(Math.round(value), 3)}m`
}

export default function getProfileMetadata(
    points: ElevationProfilePoint[]
): ElevationProfileMetadata {
    return {
        totalLinearDist: totalLinearDist(points),
        minElevation: minElevation(points),
        maxElevation: maxElevation(points),
        elevationDifference: elevationDifference(points),
        slopeDistance: slopeDistance(points),
        totalAscent: totalAscent(points),
        totalDescent: totalDescent(points),
        hikingTime: hikingTime(points),
        hasDistanceData: points.some((point) => (point.dist ?? 0) > 0),
        hasElevationData: points.some((point) => point.hasElevationData),
    }
}
