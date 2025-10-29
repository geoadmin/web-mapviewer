import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { normalizeAngle } from '@/store/modules/position/utils/normalizeAngle'

function validateNormalizeAngle(angle: number) {
    expect(angle).to.be.lte(Math.PI)
    expect(angle).to.be.gt(-Math.PI)
    const posAngle = angle < 0 ? angle + 2 * Math.PI : angle
    const negAngle = angle >= 0 ? angle - 2 * Math.PI : angle
    const equivalents = [
        posAngle,
        posAngle + 2 * Math.PI,
        posAngle + 10 * Math.PI,
        negAngle,
        negAngle - 2 * Math.PI,
        negAngle - 10 * Math.PI,
    ]
    equivalents.forEach((equivalent) => {
        if (equivalent === 0 || equivalent === Math.PI) {
            expect(normalizeAngle(equivalent)).to.equal(angle)
        } else {
            expect(normalizeAngle(equivalent)).to.be.closeTo(angle, 1e-9)
        }
    })
}

describe('Rotation is set correctly in the store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('Check normalizeAngle()', () => {
        validateNormalizeAngle(0)
        validateNormalizeAngle(Math.PI / 4)
        validateNormalizeAngle(Math.PI / 2)
        validateNormalizeAngle(Math.PI)
        validateNormalizeAngle(-(Math.PI / 4))
        validateNormalizeAngle(-(Math.PI / 2))
    })
})
