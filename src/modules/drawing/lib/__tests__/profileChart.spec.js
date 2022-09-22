import ProfileChart from '@/modules/drawing/lib/ProfileChart'
import { expect } from 'chai'
import { describe, it } from 'vitest'

function generateProfileChart(data) {
    const options = {
        margin: { left: 0, right: 0, bottom: 0, top: 0 },
        width: 0,
        height: 0,
    }
    const chart = new ProfileChart(options)
    chart.data = chart.formatData(data)
    return chart
}

describe('Validate ProfileChart class', () => {
    describe('Validate getHeightAtDist()', () => {
        it('test with test data that has regular increase of width', () => {
            const testData = [
                { alts: { COMB: 10 }, dist: 0 },
                { alts: { COMB: 20 }, dist: 100 },
                { alts: { COMB: 30 }, dist: 200 },
            ]
            const chart = generateProfileChart(testData)
            expect(chart.getHeightAtDist(-10)).to.be.closeTo(10, 1e-9)
            expect(chart.getHeightAtDist(0)).to.be.closeTo(10, 1e-9)
            expect(chart.getHeightAtDist(150)).to.be.closeTo(25, 1e-9)
            expect(chart.getHeightAtDist(200)).to.be.closeTo(30, 1e-9)
            expect(chart.getHeightAtDist(300)).to.be.closeTo(30, 1e-9)

            // Check that results are also correct if they are floating point numbers
            expect(chart.getHeightAtDist(1)).to.be.closeTo(10.1, 1e-9)
            expect(chart.getHeightAtDist(1.1)).to.be.closeTo(10.11, 1e-9)
        })
        it('test with test data that has irregular increase of width', () => {
            const testData = [
                { alts: { COMB: 10 }, dist: 0 },
                { alts: { COMB: 20 }, dist: 10 },
                { alts: { COMB: 30 }, dist: 200 },
            ]
            const chart = generateProfileChart(testData)
            expect(chart.getHeightAtDist(0)).to.be.closeTo(10, 1e-9)
            expect(chart.getHeightAtDist(5)).to.be.closeTo(15, 1e-9)
            expect(chart.getHeightAtDist(10)).to.be.closeTo(20, 1e-9)
            expect(chart.getHeightAtDist(105)).to.be.closeTo(25, 1e-9)
            expect(chart.getHeightAtDist(200)).to.be.closeTo(30, 1e-9)
        })
    })
})
