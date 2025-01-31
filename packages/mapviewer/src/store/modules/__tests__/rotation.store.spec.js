import { expect } from 'chai'
import { describe, it } from 'vitest'

// We need to import the router here to avoid error when initializing router plugins, this is
// needed since some store plugins might require access to router to get the query parameters
// (e.g. topic management plugin)
import router from '@/router' // eslint-disable-line no-unused-vars
import store from '@/store'
import { normalizeAngle } from '@/store/modules/position.store'

function validateNormalizeAngle(angle) {
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
    it('Check normalizeAngle()', () => {
        validateNormalizeAngle(0)
        validateNormalizeAngle(Math.PI / 4)
        validateNormalizeAngle(Math.PI / 2)
        validateNormalizeAngle(Math.PI)
        validateNormalizeAngle(-(Math.PI / 4))
        validateNormalizeAngle(-(Math.PI / 2))
    })
    it('Store starts with a rotation of 0', async () => {
        expect(store.state.position.rotation).to.be.equal(0)
    })
    it('setAngle normalizes the angle', async () => {
        await store.dispatch('setRotation', {
            rotation: 3 * Math.PI + Math.PI / 2,
            dispatcher: 'unit-test',
        })
        expect(store.state.position.rotation).to.be.closeTo(-(Math.PI / 2), 1e-9)
    })
})
