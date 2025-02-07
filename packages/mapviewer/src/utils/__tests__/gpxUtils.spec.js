import { expect } from 'chai'
import { LV95 } from 'geoadmin/proj'
import { describe, it } from 'vitest'

import { parseGpx } from '@/utils/gpxUtils.js'

describe('Test GPX utils', () => {
    describe('parseGpx', () => {
        it('handles correctly invalid inputs', () => {
            expect(parseGpx()).to.be.null
            expect(parseGpx(null, null)).to.be.null
            expect(parseGpx(0, LV95)).to.be.null
            expect(parseGpx([], LV95)).to.be.null
            expect(parseGpx({}, LV95)).to.be.null
            expect(parseGpx('', LV95)).to.be.null
        })
        // further testing isn't really necessary as it's using out-of-the-box OL functions
    })
})
