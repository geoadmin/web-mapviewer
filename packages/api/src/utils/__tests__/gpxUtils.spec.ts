import { LV95 } from '@swissgeo/coordinates'
import { describe, expect, it } from 'vitest'

import gpxUtils from '@/utils/gpxUtils'

describe('Test GPX utils', () => {
    describe('parseGpx', () => {
        it('handles correctly invalid inputs', () => {
            expect(gpxUtils.parseGpx('', LV95)).to.eql([])
        })
        // further testing isn't really necessary as it's using out-of-the-box OL functions
    })
})
