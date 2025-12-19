import type { default as Feature } from 'ol/Feature'

import { WEBMERCATOR } from '@swissgeo/coordinates'
import { layerUtils } from '@swissgeo/layers/utils'
import { getServiceKmlBaseUrl } from '@swissgeo/staging-config'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'

import type { EditableFeature, EditableFeatureTypes } from '@/types/features'
import type { DrawingIconSet } from '@/types/icons'

import featureStyleUtils from '@/utils/featureStyleUtils'
import kmlUtils from '@/utils/kmlUtils'

const fakeDefaultIconSet: DrawingIconSet = {
    name: 'default',
    isColorable: true,
    iconsURL: 'https://totally.fake.url',
    templateURL: 'https://tottally.fake.template',
    hasDescription: false,
    language: 'en',
    // adding the 3 icons from the default set found in mfgeoadmin3TestKml.kml
    icons: [
        {
            name: '001-marker',
            imageURL: 'https://fake.image.url',
            imageTemplateURL: 'https://fake.template.url',
            iconSetName: 'default',
            anchor: [0, 0],
            size: [48, 48],
        },
        {
            name: '002-circle',
            imageURL: 'https://fake.image.url',
            imageTemplateURL: 'https://fake.template.url',
            iconSetName: 'default',
            anchor: [0, 0],
            size: [48, 48],
        },
        {
            name: '0003-square',
            imageURL: 'https://fake.image.url',
            imageTemplateURL: 'https://fake.template.url',
            iconSetName: 'default',
            anchor: [0, 0],
            size: [48, 48],
        },
    ],
}
const fakeBabsIconSet: DrawingIconSet = {
    name: 'babs',
    isColorable: false,
    iconsURL: 'https://another.fake.url',
    templateURL: 'https://another.fake.template',
    hasDescription: true,
    language: 'en',
    icons: [
        {
            name: 'babs-3',
            imageURL: 'https://fake.image.url',
            imageTemplateURL: 'https://fake.template.url',
            iconSetName: 'babs',
            anchor: [0, 0],
            size: [48, 48],
            description: {
                en: 'some description',
            },
        },
    ],
}
export const fakeIconSets: DrawingIconSet[] = [fakeDefaultIconSet, fakeBabsIconSet]

function performStandardChecks(
    feature: EditableFeature | undefined,
    expectedFeatureType: EditableFeatureTypes,
    expectedTitle: string = '',
    expectedDescription: string = '',
    expectedCoordinateCount: number = 3
): void {
    expect(feature).toBeDefined()
    expect(feature!.coordinates).toBeDefined()
    expect(feature!.coordinates).to.have.length.greaterThan(0)

    if (feature!.coordinates.length === 1) {
        expect(feature!.coordinates[0]).to.have.length(expectedCoordinateCount)
    } else {
        expect(feature!.coordinates).to.have.length(expectedCoordinateCount)
    }

    expect(feature!.title).to.be.equal(expectedTitle)
    expect(feature!.description).to.equal(expectedDescription)
    expect(feature!.featureType).to.be.equal(expectedFeatureType)
}

describe('Validate deserialization of the mf-geoadmin3 viewer kml format', () => {
    let features: EditableFeature[] = []

    function findFeatureWithId(featureId: string) {
        return features.find((feature) => feature.id === featureId)
    }

    beforeEach(() => {
        const kml = readFileSync(resolve(__dirname, './mfgeoadmin3TestKml.kml'), 'utf8')
        const kmlLayer = layerUtils.makeKMLLayer({
            kmlFileUrl: getServiceKmlBaseUrl(), // so that it is not considered external
            kmlData: kml,
        })
        const resolution = 12345
        const olFeatures: Feature[] = kmlUtils.parseKml(
            kmlLayer,
            WEBMERCATOR,
            fakeIconSets,
            resolution
        )
        features = olFeatures
            .map((f) => f.get('editableFeature'))
            .filter((f) => f !== undefined) as EditableFeature[]
    })
    describe('icon parsing', () => {
        it('parses a marker with a very small scale and blue fill color correctly', () => {
            const icon = findFeatureWithId('marker_1668530694970')
            performStandardChecks(icon, 'MARKER', 'icon 1', 'desc 1')
            expect(icon!.icon).toBeDefined()
            expect(icon!.icon!.name).to.be.equal('001-marker')
            expect(icon!.fillColor).to.be.equal('#0000ff')
            expect(icon!.iconSize).to.be.equal(featureStyleUtils.SMALL)
        })
        it('parses a marker with a small scale and grey fill color correctly', () => {
            const icon = findFeatureWithId('marker_1668530774636')
            performStandardChecks(icon, 'MARKER', 'icon 2', 'desc 2')
            expect(icon!.icon).toBeDefined()
            expect(icon!.icon!.name).to.be.equal('002-circle')
            expect(icon!.fillColor).to.be.equal(featureStyleUtils.GRAY)
            expect(icon!.iconSize).to.be.equal(featureStyleUtils.MEDIUM)
            expect(icon!.textColor).to.be.equal(featureStyleUtils.WHITE)
        })
        it('parses a marker with a big BABS icon correctly', () => {
            const icon = findFeatureWithId('marker_1668530823345')
            performStandardChecks(icon, 'MARKER', 'icon 3', 'desc 3')
            expect(icon!.icon).toBeDefined()
            expect(icon!.icon!.name).to.be.equal('babs-3')
            expect(icon!.fillColor).to.be.equal(featureStyleUtils.RED) // default should be red
            expect(icon!.iconSize).to.be.equal(featureStyleUtils.LARGE)
            expect(icon!.textColor).to.be.equal(featureStyleUtils.RED)
        })
    })
    describe('text parsing', () => {
        it('parses a small black text correctly', () => {
            const standardText = findFeatureWithId('annotation_1668530699494')
            performStandardChecks(standardText, 'ANNOTATION', 'text 1', '')
            expect(standardText!.textColor).to.be.equal(featureStyleUtils.BLACK)
            expect(standardText!.textSize).to.be.equal(featureStyleUtils.SMALL)
            expect(standardText!.fillColor).to.be.equal(featureStyleUtils.RED) // default should be RED even if no icon is defined
            expect(standardText!.iconSize).to.eq(featureStyleUtils.MEDIUM)
            expect(standardText!.icon).to.be.undefined
        })
        it('parses a medium blue text correctly', () => {
            const standardText = findFeatureWithId('annotation_1668530932170')
            performStandardChecks(standardText, 'ANNOTATION', 'text 2', '')
            expect(standardText!.textColor).to.be.equal(featureStyleUtils.BLUE)
            expect(standardText!.textSize).to.be.equal(featureStyleUtils.MEDIUM)
            expect(standardText!.fillColor).to.be.equal(featureStyleUtils.RED) // default should be RED even if no icon is defined
            expect(standardText!.iconSize).to.eq(featureStyleUtils.MEDIUM)
            expect(standardText!.icon).to.be.undefined
        })
        it('parses a large gray text correctly', () => {
            const standardText = findFeatureWithId('annotation_1668530944079')
            performStandardChecks(standardText, 'ANNOTATION', 'text 3', '')
            expect(standardText!.textColor).to.be.equal(featureStyleUtils.GRAY)
            expect(standardText!.textSize).to.be.equal(featureStyleUtils.LARGE)
            expect(standardText!.fillColor).to.be.equal(featureStyleUtils.RED) // default should be RED even if no icon is defined
            expect(standardText!.iconSize).to.eq(featureStyleUtils.MEDIUM)
            expect(standardText!.icon).to.be.undefined
        })
    })
    describe('line/polygon parsing', () => {
        it('parses a line/polygon with two points and black fill correctly', () => {
            const line = findFeatureWithId('linepolygon_1668530962424')
            performStandardChecks(line, 'LINEPOLYGON', '', 'desc 7', 2)
            expect(line!.fillColor).to.be.equal(featureStyleUtils.BLACK)
            expect(line!.iconSize).to.eq(featureStyleUtils.MEDIUM)
            expect(line!.icon).to.be.undefined
        })
        it('parses a line/polygon with two points and blue fill correctly', () => {
            const line = findFeatureWithId('linepolygon_1668530991477')
            performStandardChecks(line, 'LINEPOLYGON', '', 'desc 8', 2)
            expect(line!.fillColor).to.be.equal(featureStyleUtils.BLUE)
            expect(line!.iconSize).to.eq(featureStyleUtils.MEDIUM)
            expect(line!.icon).to.be.undefined
        })
        it('parses a line/polygon with five points and yellow fill correctly', () => {
            const line = findFeatureWithId('linepolygon_1668625663095')
            performStandardChecks(line, 'LINEPOLYGON', '', 'desc 9', 5)
            expect(line!.fillColor).to.be.equal(featureStyleUtils.YELLOW)
            expect(line!.iconSize).to.eq(featureStyleUtils.MEDIUM)
            expect(line!.icon).to.be.undefined
        })
    })
    describe('measure parsing', () => {
        it('parses a measure with two points correctly', () => {
            const line = findFeatureWithId('measure_1668531023034')
            performStandardChecks(line, 'MEASURE', '', '', 2)
        })
        it('parses a measure with three points correctly', () => {
            const line = findFeatureWithId('measure_1668531037052')
            performStandardChecks(line, 'MEASURE', '', '', 3)
        })
    })
})
