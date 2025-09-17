import { WEBMERCATOR } from '@swissgeo/coordinates'
import { layerUtils } from '@swissgeo/layers/utils'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'
import type { default as OLFeature } from 'ol/Feature'

import EditableFeature, { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import type { DrawingIconSet } from '@/api/icon.api'
import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import { BLACK, BLUE, GRAY, LARGE, MEDIUM, RED, SMALL, WHITE, YELLOW } from '@/utils/featureStyleUtils'
import { parseKml } from '@/utils/kmlUtils'

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
            size: [48, 48]
        },
        {
            name: '002-circle',
            imageURL: 'https://fake.image.url',
            imageTemplateURL: 'https://fake.template.url',
            iconSetName: 'default',
            anchor: [0, 0],
            size: [48, 48]
        },
        {
            name: '0003-square',
            imageURL: 'https://fake.image.url',
            imageTemplateURL: 'https://fake.template.url',
            iconSetName: 'default',
            anchor: [0, 0],
            size: [48, 48]
        },
    ]
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
                'en': 'some description',
            }
        },
    ]
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
    if (feature!.coordinates!.length === 1) {
        expect(feature!.coordinates![0]).to.have.length(expectedCoordinateCount)
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
        const olFeatures: OLFeature[] = parseKml(kmlLayer, WEBMERCATOR, resolution, fakeIconSets)
        features = olFeatures.map((f) => f.get('editableFeature'))
    })
    describe('icon parsing', () => {
        it('parses a marker with a very small scale and blue fill color correctly', () => {
            const icon = findFeatureWithId('marker_1668530694970')
            performStandardChecks(icon, EditableFeatureTypes.MARKER, 'icon 1', 'desc 1')
            expect(icon!.icon).toBeDefined()
            expect(icon!.icon!.name).to.be.equal('001-marker')
            expect(icon!.fillColor).to.be.equal(BLUE)
            expect(icon!.iconSize).to.be.equal(SMALL)
        })
        it('parses a marker with a small scale and grey fill color correctly', () => {
            const icon = findFeatureWithId('marker_1668530774636')
            performStandardChecks(icon, EditableFeatureTypes.MARKER, 'icon 2', 'desc 2')
            expect(icon!.icon).toBeDefined()
            expect(icon!.icon!.name).to.be.equal('002-circle')
            expect(icon!.fillColor).to.be.equal(GRAY)
            expect(icon!.iconSize).to.be.equal(MEDIUM)
            expect(icon!.textColor).to.be.equal(WHITE)
        })
        it('parses a marker with a big BABS icon correctly', () => {
            const icon = findFeatureWithId('marker_1668530823345')
            performStandardChecks(icon, EditableFeatureTypes.MARKER, 'icon 3', 'desc 3')
            expect(icon!.icon).toBeDefined()
            expect(icon!.icon!.name).to.be.equal('babs-3')
            expect(icon!.fillColor).to.be.equal(RED) // default should be red
            expect(icon!.iconSize).to.be.equal(LARGE)
            expect(icon!.textColor).to.be.equal(RED)
        })
    })
    describe('text parsing', () => {
        it('parses a small black text correctly', () => {
            const standardText = findFeatureWithId('annotation_1668530699494')
            performStandardChecks(standardText, EditableFeatureTypes.ANNOTATION, 'text 1', '')
            expect(standardText!.textColor).to.be.equal(BLACK)
            expect(standardText!.textSize).to.be.equal(SMALL)
            expect(standardText!.fillColor).to.be.equal(RED) // default should be RED even if no icon is defined
            expect(standardText!.iconSize).to.eq(MEDIUM)
            expect(standardText!.icon).to.be.undefined
        })
        it('parses a medium blue text correctly', () => {
            const standardText = findFeatureWithId('annotation_1668530932170')
            performStandardChecks(standardText, EditableFeatureTypes.ANNOTATION, 'text 2', '')
            expect(standardText!.textColor).to.be.equal(BLUE)
            expect(standardText!.textSize).to.be.equal(MEDIUM)
            expect(standardText!.fillColor).to.be.equal(RED) // default should be RED even if no icon is defined
            expect(standardText!.iconSize).to.eq(MEDIUM)
            expect(standardText!.icon).to.be.undefined
        })
        it('parses a large gray text correctly', () => {
            const standardText = findFeatureWithId('annotation_1668530944079')
            performStandardChecks(standardText, EditableFeatureTypes.ANNOTATION, 'text 3', '')
            expect(standardText!.textColor).to.be.equal(GRAY)
            expect(standardText!.textSize).to.be.equal(LARGE)
            expect(standardText!.fillColor).to.be.equal(RED) // default should be RED even if no icon is defined
            expect(standardText!.iconSize).to.eq(MEDIUM)
            expect(standardText!.icon).to.be.undefined
        })
    })
    describe('line/polygon parsing', () => {
        it('parses a line/polygon with two points and black fill correctly', () => {
            const line = findFeatureWithId('linepolygon_1668530962424')
            performStandardChecks(line, EditableFeatureTypes.LINEPOLYGON, '', 'desc 7', 2)
            expect(line!.fillColor).to.be.equal(BLACK)
            expect(line!.iconSize).to.eq(MEDIUM)
            expect(line!.icon).to.be.undefined
        })
        it('parses a line/polygon with two points and blue fill correctly', () => {
            const line = findFeatureWithId('linepolygon_1668530991477')
            performStandardChecks(line, EditableFeatureTypes.LINEPOLYGON, '', 'desc 8', 2)
            expect(line!.fillColor).to.be.equal(BLUE)
            expect(line!.iconSize).to.eq(MEDIUM)
            expect(line!.icon).to.be.undefined
        })
        it('parses a line/polygon with five points and yellow fill correctly', () => {
            const line = findFeatureWithId('linepolygon_1668625663095')
            performStandardChecks(line, EditableFeatureTypes.LINEPOLYGON, '', 'desc 9', 5)
            expect(line!.fillColor).to.be.equal(YELLOW)
            expect(line!.iconSize).to.eq(MEDIUM)
            expect(line!.icon).to.be.undefined
        })
    })
    describe('measure parsing', () => {
        it('parses a measure with two points correctly', () => {
            const line = findFeatureWithId('measure_1668531023034')
            performStandardChecks(line, EditableFeatureTypes.MEASURE, '', '', 2)
        })
        it('parses a measure with three points correctly', () => {
            const line = findFeatureWithId('measure_1668531037052')
            performStandardChecks(line, EditableFeatureTypes.MEASURE, '', '', 3)
        })
    })
})
