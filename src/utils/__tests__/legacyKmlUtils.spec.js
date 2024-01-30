import { expect } from 'chai'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { beforeEach, describe, it } from 'vitest'

import { EditableFeatureTypes } from '@/api/features.api'
import { DrawingIcon, DrawingIconSet } from '@/api/icon.api'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import {
    BLACK,
    BLUE,
    GRAY,
    LARGE,
    MEDIUM,
    RED,
    SMALL,
    VERY_SMALL,
    WHITE,
    YELLOW,
} from '@/utils/featureStyleUtils'
import { parseKml } from '@/utils/kmlUtils'

const fakeDefaultIconSet = new DrawingIconSet(
    'default',
    true,
    'https://totally.fake.url',
    'https://tottally.fake.template'
)
// adding the 3 icons from the default set found in mfgeoadmin3TestKml.kml
fakeDefaultIconSet.icons = [
    new DrawingIcon(
        '001-marker',
        'https://fake.image.url',
        'https://fake.template.url',
        'default',
        [0, 0]
    ),
    new DrawingIcon(
        '002-circle',
        'https://fake.image.url',
        'https://fake.template.url',
        'default',
        [0, 0]
    ),
    new DrawingIcon(
        '0003-square',
        'https://fake.image.url',
        'https://fake.template.url',
        'default',
        [0, 0]
    ),
]
const fakeBabsIconSet = new DrawingIconSet(
    'babs',
    false,
    'https://another.fake.url',
    'https://another.fake.template'
)
fakeBabsIconSet.icons = [
    new DrawingIcon(
        'babs-3',
        'https://fake.image.url',
        'https://fake.template.url',
        'default',
        [0, 0]
    ),
]
const fakeIconSets = [fakeDefaultIconSet, fakeBabsIconSet]

/**
 * @param {EditableFeature} feature
 * @param {EditableFeatureTypes} expectedFeatureType
 * @param {String} expectedTitle
 * @param {String} expectedDescription
 * @param {Number} expectedCoordinateCount
 */
function performStandardChecks(
    feature,
    expectedFeatureType,
    expectedTitle = '',
    expectedDescription = '',
    expectedCoordinateCount = 3
) {
    expect(feature).to.be.not.null.and.not.undefined
    expect(feature.coordinates).to.have.length.greaterThan(0)
    if (feature.coordinates.length === 1) {
        expect(feature.coordinates[0]).to.have.length(expectedCoordinateCount)
    } else {
        expect(feature.coordinates).to.have.length(expectedCoordinateCount)
    }
    // checking that it matches also what is defined in the underlying OL object
    const olCoordinates = feature.olFeature.getGeometry().getCoordinates()
    // if olCoordinates is only 1 in length, it means it is a closed polygon and we
    // need to check the length of this polygon
    if (olCoordinates.length === 1) {
        expect(olCoordinates[0]).to.have.length(expectedCoordinateCount)
    } else {
        expect(olCoordinates).to.have.length(expectedCoordinateCount)
    }
    expect(feature.title).to.be.equal(expectedTitle)
    expect(feature.description).to.equal(expectedDescription)
    expect(feature.featureType).to.be.equal(expectedFeatureType)
}

describe('Validate deserialization of the mf-geoadmin3 viewer kml format', () => {
    let features = []

    function findFeatureWithId(featureId) {
        return features.find((feature) => feature.id === featureId)
    }

    beforeEach(() => {
        const kml = readFileSync(resolve(__dirname, './mfgeoadmin3TestKml.kml'), 'utf8')
        const olFeatures = parseKml(kml, WEBMERCATOR, fakeIconSets)
        features = olFeatures.map((f) => {
            const ef = f.get('editableFeature')
            ef.olFeature = f
            return ef
        })
    })
    describe('icon parsing', () => {
        it('parses a marker with a very small scale and blue fill color correctly', () => {
            // ID in legacy KML is marker_1668530694970 but "marker" will be replaced by "drawing_feature"
            const icon = findFeatureWithId('drawing_feature_1668530694970')
            performStandardChecks(icon, EditableFeatureTypes.MARKER, 'icon 1', 'desc 1')
            expect(icon.icon.name).to.be.equal('001-marker')
            expect(icon.fillColor).to.be.equal(BLUE)
            // old KMLs were using scales 0.5, 0.75 and 1.0, we are now having an extra 1.5 scale
            // so legacy SMALL size has become VERY_SMALL
            expect(icon.iconSize).to.be.equal(VERY_SMALL)
        })
        it('parses a marker with a small scale and grey fill color correctly', () => {
            const icon = findFeatureWithId('drawing_feature_1668530774636')
            performStandardChecks(icon, EditableFeatureTypes.MARKER, 'icon 2', 'desc 2')
            expect(icon.icon.name).to.be.equal('002-circle')
            expect(icon.fillColor).to.be.equal(GRAY)
            expect(icon.iconSize).to.be.equal(SMALL)
            expect(icon.textColor).to.be.equal(WHITE)
        })
        it('parses a marker with a big BABS icon correctly', () => {
            const icon = findFeatureWithId('drawing_feature_1668530823345')
            performStandardChecks(icon, EditableFeatureTypes.MARKER, 'icon 3', 'desc 3')
            expect(icon.icon.name).to.be.equal('babs-3')
            expect(icon.fillColor).to.be.equal(RED) // default should be red
            expect(icon.iconSize).to.be.equal(MEDIUM)
            expect(icon.textColor).to.be.equal(RED)
        })
    })
    describe('text parsing', () => {
        it('parses a small black text correctly', () => {
            const standardText = findFeatureWithId('drawing_feature_1668530699494')
            performStandardChecks(standardText, EditableFeatureTypes.ANNOTATION, 'text 1', '')
            expect(standardText.textColor).to.be.equal(BLACK)
            expect(standardText.textSize).to.be.equal(VERY_SMALL)
            expect(standardText.fillColor).to.be.equal(RED) // default should be RED even if no icon is defined
            expect(standardText.iconSize).to.be.equal(MEDIUM) // default should be MEDIUM even if no icon is defined
            expect(standardText.icon).to.be.null
        })
        it('parses a medium blue text correctly', () => {
            const standardText = findFeatureWithId('drawing_feature_1668530932170')
            performStandardChecks(standardText, EditableFeatureTypes.ANNOTATION, 'text 2', '')
            expect(standardText.textColor).to.be.equal(BLUE)
            expect(standardText.textSize).to.be.equal(MEDIUM)
            expect(standardText.fillColor).to.be.equal(RED) // default should be RED even if no icon is defined
            expect(standardText.iconSize).to.be.equal(MEDIUM) // default should be MEDIUM even if no icon is defined
            expect(standardText.icon).to.be.null
        })
        it('parses a large gray text correctly', () => {
            const standardText = findFeatureWithId('drawing_feature_1668530944079')
            performStandardChecks(standardText, EditableFeatureTypes.ANNOTATION, 'text 3', '')
            expect(standardText.textColor).to.be.equal(GRAY)
            expect(standardText.textSize).to.be.equal(LARGE)
            expect(standardText.fillColor).to.be.equal(RED) // default should be RED even if no icon is defined
            expect(standardText.iconSize).to.be.equal(MEDIUM) // default should be MEDIUM even if no icon is defined
            expect(standardText.icon).to.be.null
        })
    })
    describe('line/polygon parsing', () => {
        it('parses a line/polygon with two points and black fill correctly', () => {
            const line = findFeatureWithId('drawing_feature_1668530962424')
            performStandardChecks(line, EditableFeatureTypes.LINEPOLYGON, '', 'desc 7', 2)
            expect(line.textColor).to.be.equal(RED)
            expect(line.textSize).to.be.equal(MEDIUM)
            expect(line.fillColor).to.be.equal(BLACK)
            expect(line.iconSize).to.be.equal(MEDIUM)
            expect(line.icon).to.be.null
        })
        it('parses a line/polygon with two points and blue fill correctly', () => {
            const line = findFeatureWithId('drawing_feature_1668530991477')
            performStandardChecks(line, EditableFeatureTypes.LINEPOLYGON, '', 'desc 8', 2)
            expect(line.textColor).to.be.equal(RED)
            expect(line.textSize).to.be.equal(MEDIUM)
            expect(line.fillColor).to.be.equal(BLUE)
            expect(line.iconSize).to.be.equal(MEDIUM)
            expect(line.icon).to.be.null
        })
        it('parses a line/polygon with five points and yello fill correctly', () => {
            const line = findFeatureWithId('drawing_feature_1668625663095')
            performStandardChecks(line, EditableFeatureTypes.LINEPOLYGON, '', 'desc 9', 5)
            expect(line.textColor).to.be.equal(RED)
            expect(line.textSize).to.be.equal(MEDIUM)
            expect(line.fillColor).to.be.equal(YELLOW)
            expect(line.iconSize).to.be.equal(MEDIUM)
            expect(line.icon).to.be.null
        })
    })
    describe('measure parsing', () => {
        it('parses a measure with two points correctly', () => {
            const line = findFeatureWithId('drawing_feature_1668531023034')
            performStandardChecks(line, EditableFeatureTypes.MEASURE, '', '', 2)
        })
        it('parses a measure with three points correctly', () => {
            const line = findFeatureWithId('drawing_feature_1668531037052')
            performStandardChecks(line, EditableFeatureTypes.MEASURE, '', '', 3)
        })
    })
})
