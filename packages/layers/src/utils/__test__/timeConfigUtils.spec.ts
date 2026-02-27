import { expect } from 'chai'
import { describe, it } from 'vitest'

import type { Layer } from '@/types/layers'

import { LayerType } from '@/types/layers'
import timeConfigUtils from '@/utils/timeConfigUtils'

describe('Test utility functions', () => {
    it('Determines correctly that a layer has multiple timestamps', () => {
        const simpleLayer: Layer = {
            uuid: 'one-two-three-four',
            name: 'simple',
            id: 'ch.bgdi.simple',
            opacity: 0,
            isVisible: true,
            type: LayerType.WMTS,
            attributions: [],
            hasTooltip: false,
            hasDescription: false,
            hasError: false,
            hasLegend: false,
            isExternal: false,
            isLoading: false,
            baseUrl: 'http://bgdi.ch',
            hasWarning: false,
            timeConfig: {
                timeEntries: [],
            },
        }

        expect(timeConfigUtils.hasMultipleTimestamps(simpleLayer)).to.be.false

        simpleLayer.timeConfig = {
            timeEntries: [],
            behaviour: 'last',
            currentTimeEntry: undefined,
        }

        expect(timeConfigUtils.hasMultipleTimestamps(simpleLayer)).to.be.false

        simpleLayer.timeConfig.timeEntries.push(timeConfigUtils.makeTimeConfigEntry('200223123'))

        expect(timeConfigUtils.hasMultipleTimestamps(simpleLayer)).to.be.false

        simpleLayer.timeConfig.timeEntries.push(timeConfigUtils.makeTimeConfigEntry('200523123'))

        expect(timeConfigUtils.hasMultipleTimestamps(simpleLayer)).to.be.true
    })
})
