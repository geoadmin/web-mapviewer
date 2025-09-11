import { describe, expect, it } from 'vitest'

import { stitchMultiLine } from '../profile.store.js'

function checkLines(expectedResult, result) {
    expect(result).to.be.an('Array')
    expect(result).to.have.lengthOf(
        expectedResult.length,
        `Result length mismatch\n\nexpected: ${JSON.stringify(expectedResult)}\ngot: ${JSON.stringify(result)}]\n\n`
    )
    expectedResult.forEach((line, index) => {
        const resultLine = result[index]
        expect(resultLine)
            .to.be.an('Array')
            .lengthOf(
                line.length,
                `Result line at index ${index} length mismatch\n\nexpected: ${JSON.stringify(line)}\ngot: ${JSON.stringify(resultLine)}\n\n`
            )
        line.forEach((point, index) => {
            expect(resultLine[index]).to.deep.equal(
                point,
                `Line ${index} point ${index}\n\nexpected: ${JSON.stringify(expectedResult)}\ngot: ${JSON.stringify(result)}\n\n`
            )
        })
    })
}

describe('Test function stitchMultiLine', () => {
    const testTolerance = 10.0
    it('Returns the input if there is nothign to stitch', () => {
        const input = [
            [
                [1, 1],
                [2, 2],
            ],
            [
                [100, 100],
                [200, 200],
            ],
        ]
        const output = stitchMultiLine(input, testTolerance)
        checkLines(input, output)
    })
    it('Stitches lines if they are less than or exactly 10m apart', () => {
        const input = [
            [
                [1, 1],
                [2, 2],
            ],
            [
                [12, 2],
                [13, 13],
            ],
        ]
        const output = stitchMultiLine(input, testTolerance)
        checkLines(
            [
                [
                    [1, 1],
                    [2, 2],
                    [12, 2],
                    [13, 13],
                ],
            ],
            output
        )
    })
    it('Stitches multiples segment into one if it is possible', () => {
        const input = [
            [
                [1, 1],
                [2, 2],
            ],
            [
                [12, 2],
                [13, 13],
            ],
            [
                [20, 13],
                [21, 21],
                [22, 22],
            ],
            [
                [30, 22],
                [31, 31],
            ],
            [
                [100, 100],
                [200, 200],
            ],
        ]
        const output = stitchMultiLine(input, testTolerance)
        checkLines(
            [
                [
                    [1, 1],
                    [2, 2],
                    [12, 2],
                    [13, 13],
                    [20, 13],
                    [21, 21],
                    [22, 22],
                    [30, 22],
                    [31, 31],
                ],
                [
                    [100, 100],
                    [200, 200],
                ],
            ],
            output
        )
    })
    it('stitches multiples segment into one when some are inverted', () => {
        const input = [
            [
                [1, 1],
                [2, 2],
            ],
            [
                [12, 2],
                [13, 13],
            ],
            [
                [22, 22],
                [21, 21],
                [20, 13],
            ],
            [
                [31, 31],
                [30, 22],
            ],
            [
                [100, 100],
                [200, 200],
            ],
        ]
        const output = stitchMultiLine(input, testTolerance)
        checkLines(
            [
                [
                    [1, 1],
                    [2, 2],
                    [12, 2],
                    [13, 13],
                    [20, 13],
                    [21, 21],
                    [22, 22],
                    [30, 22],
                    [31, 31],
                ],
                [
                    [100, 100],
                    [200, 200],
                ],
            ],
            output
        )
    })
})
