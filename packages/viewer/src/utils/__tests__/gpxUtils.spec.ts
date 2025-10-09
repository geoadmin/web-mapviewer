import { LV95 } from '@swissgeo/coordinates'
import { describe, expect, it } from 'vitest'

import { parseGpx } from '@/utils/gpxUtils'

describe('Test GPX utils', () => {
    describe('parseGpx', () => {
        it('handles correctly invalid inputs', () => {
            expect(parseGpx('', LV95)).to.be.null
        })
        // further testing isn't really necessary as it's using out-of-the-box OL functions
    })
})
