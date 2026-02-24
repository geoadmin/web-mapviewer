/**
 * Normalizes any angle so that -PI < result <= PI
 *
 * @param rotation Angle in radians
 * @returns Normalized angle in radians in range -PI < result <= PI
 */
export function normalizeAngle(rotation: number): number {
    while (rotation > Math.PI) {
        rotation -= 2 * Math.PI
    }
    while (rotation < -Math.PI || Math.abs(rotation + Math.PI) < 1e-9) {
        rotation += 2 * Math.PI
    }
    // Automatically fully northen the map if the user has set it approximately to the north.
    if (Math.abs(rotation) < 1e-2) {
        rotation = 0
    }
    return rotation
}
