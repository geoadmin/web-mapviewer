import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import setupProj4 from '@/utils/setupProj4'
import { describe, expect, it } from 'vitest'

setupProj4()

describe('CoordinateSystem', () => {
    describe('getBoundsAs', () => {
        it('returns null if the bounds are not defined', () => {
            const testInstance = new CoordinateSystem('test', 'test', 1234, 'test', '', null)
            expect(testInstance.getBoundsAs(WEBMERCATOR)).to.be.null
        })
    })
})
