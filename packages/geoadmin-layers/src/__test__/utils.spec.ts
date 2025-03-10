import { expect } from "chai"
import {  describe, it } from "vitest"

import { type Layer, LayerType} from "@/layers"
import { hasMultipleTimestamps } from "@/utils";

describe('Test utility functions', () => {
    it('Determines correctly that a layer has multiple timestamps', () => {
        const simpleLayer: Layer = {
            name: 'simple',
            id: 'ch.bgdi.simple',
            opacity: 0,
            visible: true,
            type: LayerType.WMTS,
            attributions: [],
            hasTooltip: false,
            hasDescription: false,
            hasError: false,
            hasLegend: false,
            isExternal: false,
            isLoading: false,
            baseUrl: "http://bgdi.ch"
        }

        expect(hasMultipleTimestamps(simpleLayer)).to.be.false

        simpleLayer.timeConfig = {
            timeEntries: [],
            behaviour: 'last',
            years: [2002, 2003],
            currentTimeEntry: 2002,
            currentTimestamp: '20021322',
            currentYear: 2002
        }

        expect(hasMultipleTimestamps(simpleLayer)).to.be.false

        simpleLayer.timeConfig.timeEntries.push({
            timestamp: '200223123'
        })

        expect(hasMultipleTimestamps(simpleLayer)).to.be.false

        simpleLayer.timeConfig.timeEntries.push({
            timestamp: '200523123'
        })

        expect(hasMultipleTimestamps(simpleLayer)).to.be.true
    })
})
