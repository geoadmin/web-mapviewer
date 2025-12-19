import { describe, expect, it } from 'vitest'

import styleUtils from '@/styleUtils'

describe('Style utils tests', () => {
    describe('hexToRgba', () => {
        it('converts a 6-character hex with # to RGBA array', () => {
            expect(styleUtils.hexToRgba('#ff0000')).toEqual([255, 0, 0, 1.0])
            expect(styleUtils.hexToRgba('#00ff00')).toEqual([0, 255, 0, 1.0])
            expect(styleUtils.hexToRgba('#0000ff')).toEqual([0, 0, 255, 1.0])
        })

        it('converts a 6-character hex without # to RGBA array', () => {
            expect(styleUtils.hexToRgba('ff0000')).toEqual([255, 0, 0, 1.0])
        })

        it('converts a 3-character hex with # to RGBA array', () => {
            expect(styleUtils.hexToRgba('#f00')).toEqual([255, 0, 0, 1.0])
            expect(styleUtils.hexToRgba('#0f0')).toEqual([0, 255, 0, 1.0])
            expect(styleUtils.hexToRgba('#00f')).toEqual([0, 0, 255, 1.0])
        })

        it('converts a 3-character hex without # to RGBA array', () => {
            expect(styleUtils.hexToRgba('f00')).toEqual([255, 0, 0, 1.0])
        })

        it('applies a custom alpha value', () => {
            expect(styleUtils.hexToRgba('#ff0000', 0.5)).toEqual([255, 0, 0, 0.5])
            expect(styleUtils.hexToRgba('#ff0000', 0)).toEqual([255, 0, 0, 0])
        })

        it('handles mixed case hex values', () => {
            expect(styleUtils.hexToRgba('#FF0000')).toEqual([255, 0, 0, 1.0])
            expect(styleUtils.hexToRgba('#fF00aA')).toEqual([255, 0, 170, 1.0])
        })

        it('returns an empty array for invalid hex strings', () => {
            // The current implementation returns [] if match fails (e.g. empty string)
            expect(styleUtils.hexToRgba('')).toEqual([])
        })
    })
})
