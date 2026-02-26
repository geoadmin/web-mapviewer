import type { Feature } from 'ol'

import { WEBMERCATOR } from '@swissgeo/coordinates'
import { layerUtils } from '@swissgeo/layers/utils'
import { getServiceKmlBaseUrl } from '@swissgeo/staging-config'
import { readFileSync } from 'fs'
import IconStyle from 'ol/style/Icon'
import { resolve } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'

import type { EditableFeature } from '@/types/features'
import type { DrawingIconSet } from '@/types/icons'

import iconsAPI from '@/icons'
import { fakeIconSets } from '@/utils/__tests__/legacyKmlUtils.spec'
import kmlUtils from '@/utils/kmlUtils'

describe('Test KML utils', () => {
    describe('get KML Extent', () => {
        it('handles correctly invalid inputs', () => {
            expect(kmlUtils.getKmlExtent('')).toBeUndefined()
        })
        it('returns null if the KML has no feature', () => {
            const emptyDocument = `<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
                <Document>
                </Document>
            </kml>
            `
            expect(kmlUtils.getKmlExtent(emptyDocument)).toBeUndefined()
        })
        it('get extent of a single feature', () => {
            const content = `<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
                <Document>
                    <Placemark>
                        <name>Sample Placemark</name>
                        <description>This is a sample KML Placemark.</description>
                        <Point>
                        <coordinates>8.117189,46.852375</coordinates>
                        </Point>
                    </Placemark>
                </Document>
            </kml>
            `
            expect(kmlUtils.getKmlExtent(content)).to.deep.equal([
                8.117189, 46.852375, 8.117189, 46.852375,
            ])
        })
        it('get extent of a single line feature crossing europe', () => {
            const content = `<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
                <Document>
                    <Placemark>
                        <name>Line accross europe and switzerland</name>
                        <description>This is a sample KML Placemark.</description>
                        <LineString>
                            <coordinates>
                                -0.771255570521181,47.49354012712542,0
                                2.274382135396515,47.72412908565185,0
                                4.437570870313552,46.75086073673278,0
                                6.524331142187565,46.85471653404525,0
                                7.977505534554298,46.45920177484218,0
                                8.377161172051387,46.87625449359594,0
                                10.28654975787117,46.54805193225931,0
                                13.85851000860247,47.33184853266135,0
                                15.69760034017345,47.60792210418662,0
                            </coordinates>
                        </LineString>
                    </Placemark>
                </Document>
            </kml>
            `
            expect(kmlUtils.getKmlExtent(content)).to.deep.equal([
                -0.771255570521181, 46.45920177484218, 15.69760034017345, 47.72412908565185,
            ])
        })
        it('get extent of multiples features (marker, line, polygone)', () => {
            const content = `<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
                <Document>
                    <Placemark>
                        <name>My Marker</name>
                        <Point>
                            <coordinates>7.659940678339698,46.95427014117109,843.3989330301123</coordinates>
                        </Point>
                    </Placemark>
                    <Placemark>
                        <name>No title</name>
                        <Point>
                            <coordinates>7.84495931692009,46.92430731160568,801.1875341365708</coordinates>
                        </Point>
                    </Placemark>
                    <Placemark>
                        <name>Polygone sans titre</name>
                        <Polygon>
                            <outerBoundaryIs>
                                <LinearRing>
                                    <coordinates>
                                        7.736857178846723,46.82670125209653,0 8.06124136917296,46.75405886506746,0 8.092263503513564,46.88254009447432,0 7.674984953448975,46.90741897412888,0 7.736857178846723,46.82670125209653,0
                                    </coordinates>
                                </LinearRing>
                            </outerBoundaryIs>
                        </Polygon>
                    </Placemark>
                    <Placemark>
                        <name>This is a line</name>
                        <LineString>
                            <coordinates>
                                7.661326190900879,46.9229765613044,0 7.736317332421581,46.95310606597951,0 7.783350668405761,46.96964910688379,0 7.819080121407933,46.95554156911379,0 7.895270534105141,46.9409704077278,0
                            </coordinates>
                        </LineString>
                    </Placemark>
                </Document>
            </kml>
            `
            expect(kmlUtils.getKmlExtent(content)).to.deep.equal([
                7.659940678339698, 46.75405886506746, 8.092263503513564, 46.96964910688379,
            ])
        })
    })
    describe('isKmlFeaturesValid', () => {
        it('returns false if there is an error in the features of the KML', () => {
            const kml = readFileSync(resolve(__dirname, './samples/kml_feature_error.kml'), 'utf8')
            expect(kmlUtils.isKmlFeaturesValid(kml)).to.be.false
        })
        it('returns true if there is no error in the features of the KML', () => {
            const kml = readFileSync(
                resolve(__dirname, './samples/webmapviewerOffsetTestKml.kml'),
                'utf8'
            )
            expect(kmlUtils.isKmlFeaturesValid(kml)).to.be.true
        })
    })
    describe('get marker title offset', () => {
        let features: EditableFeature[] = []
        function findFeatureWithId(featureId: string) {
            return features.find((feature) => feature.id === featureId)
        }

        beforeEach(() => {
            const kml = readFileSync(
                resolve(__dirname, './samples/webmapviewerOffsetTestKml.kml'),
                'utf8'
            )
            const kmlLayer = layerUtils.makeKMLLayer({
                kmlFileUrl: getServiceKmlBaseUrl(), // so that it is not considered external
                kmlData: kml,
            })
            const resolution = 1000
            const olFeatures: Feature[] = kmlUtils.parseKml(
                kmlLayer,
                WEBMERCATOR,
                fakeIconSets,
                resolution
            )
            features = olFeatures
                .map((f) => {
                    const ef = f.get('editableFeature')
                    if (ef) {
                        ef.olFeature = f
                    }
                    return ef
                })
                .filter((f) => f !== undefined) as EditableFeature[]
        })
        it('handles correctly text offset from extended data', () => {
            const icon = findFeatureWithId('drawing_feature_1714651153088')
            expect(icon).toBeDefined()
            expect(icon.textOffset).to.deep.equal([0, -44.75])
        })
        it('handles correctly text offset if no offset provided', () => {
            const icon = findFeatureWithId('drawing_feature_1714651899088')
            expect(icon).toBeDefined()
            expect(icon.textOffset).to.deep.equal([0, 0])
        })
    })
    describe('parseIconUrl', () => {
        it('parse a new icon url of a default set', () => {
            const args = kmlUtils.parseIconUrl(
                'https://sys-map.dev.bgdi.ch/api/icons/sets/default/icons/001-marker@1.5x-0,128,0.png'
            )
            expect(args).toBeDefined()
            expect(args.set).to.be.equal('default')
            expect(args.name).to.be.equal('001-marker')
            expect(args.color).toBeDefined()
            expect(args.color?.r).to.be.equal(0)
            expect(args.color?.g).to.be.equal(128)
            expect(args.color?.b).to.be.equal(0)
            expect(args.isLegacy).to.be.false
        })
        it('parse a new icon url of a default set with invalid color', () => {
            const args = kmlUtils.parseIconUrl(
                'https://sys-map.dev.bgdi.ch/api/icons/sets/default/icons/001-marker@4x-0,600,0.png'
            )
            expect(args).toBeDefined()
            expect(args.set).to.be.equal('default')
            expect(args.name).to.be.equal('001-marker')
            expect(args.color).toBeDefined()
            expect(args.color?.r).to.be.equal(0)
            expect(args.color?.g).to.be.equal(255)
            expect(args.color?.b).to.be.equal(0)
            expect(args.isLegacy).to.be.false
        })
        it('parse a new icon url of a default set with no number color', () => {
            const args = kmlUtils.parseIconUrl(
                'https://sys-map.dev.bgdi.ch/api/icons/sets/default/icons/001-marker@1.5x-0,600,a.png'
            )
            expect(args).toBeUndefined()
        })
        it('parse a new icon url of a babs set', () => {
            const args = kmlUtils.parseIconUrl(
                'https://sys-map.dev.bgdi.ch/api/icons/sets/babs/icons/babs-100@1x-255,128,3.png'
            )
            expect(args).toBeDefined()
            expect(args.set).to.be.equal('babs')
            expect(args.name).to.be.equal('babs-100')
            expect(args.color).toBeDefined()
            expect(args.color?.r).to.be.equal(255)
            expect(args.color?.g).to.be.equal(128)
            expect(args.color?.b).to.be.equal(3)
            expect(args.isLegacy).to.be.false
        })
        it('parse a new icon standard url of a default set (no scale no color)', () => {
            const args = kmlUtils.parseIconUrl(
                'https://map.geo.admin.ch/api/icons/sets/my-set/icons/my-icon.png'
            )
            expect(args).toBeUndefined()
        })
        it('parse a new icon url of a default set without scale', () => {
            const args = kmlUtils.parseIconUrl(
                'https://map.geo.admin.ch/api/icons/sets/my-set/icons/my-icon-255,0,0.png'
            )
            expect(args).toBeUndefined()
        })
        it('parse a new icon url of a default set without color', () => {
            const args = kmlUtils.parseIconUrl(
                'https://map.geo.admin.ch/api/icons/sets/my-set/icons/my-icon@1.5x.png'
            )
            expect(args).toBeUndefined()
        })
        it('parse a legacy icon url of a default set', () => {
            const args = kmlUtils.parseIconUrl(
                'https://api3.geo.admin.ch/color/45,128,23/star-24@2x.png'
            )
            expect(args).toBeDefined()
            expect(args.set).to.be.equal('default')
            expect(args.name).to.be.equal('star')
            expect(args.color).toBeDefined()
            expect(args.color?.r).to.be.equal(45)
            expect(args.color?.g).to.be.equal(128)
            expect(args.color?.b).to.be.equal(23)
            expect(args.isLegacy).to.be.true
        })
        it('parse a legacy icon url of a default set with invalid color', () => {
            const args = kmlUtils.parseIconUrl(
                'https://api3.geo.admin.ch/color/45,600,800/star-24@2x.png'
            )
            expect(args).toBeDefined()
            expect(args.set).to.be.equal('default')
            expect(args.name).to.be.equal('star')
            expect(args.color).toBeDefined()
            expect(args.color?.r).to.be.equal(45)
            // invalid color fallback to 255
            expect(args.color?.g).to.be.equal(255)
            expect(args.color?.b).to.be.equal(255)
            expect(args.isLegacy).to.be.true
        })
        it('parse a legacy icon url of a default set with non number color', () => {
            const args = kmlUtils.parseIconUrl(
                'https://api3.geo.admin.ch/color/45,a,800/star-24@2x.png'
            )
            expect(args).toBeUndefined()
        })
        it('parse a legacy icon url of a babs set', () => {
            const args = kmlUtils.parseIconUrl(
                'https://sys-api3.dev.bgdi.ch/images/babs/babs-76.png'
            )
            expect(args).toBeDefined()
            expect(args.set).to.be.equal('babs')
            expect(args.name).to.be.equal('babs-76')
            // expect default scale and color
            expect(args.color?.r).to.be.equal(255)
            expect(args.color?.g).to.be.equal(0)
            expect(args.color?.b).to.be.equal(0)
            expect(args.isLegacy).to.be.true
        })
    })
    describe('getIcon', () => {
        const fakeDefaultIconSet: DrawingIconSet = {
            name: 'default',
            isColorable: true,
            hasDescription: false,
            language: 'en',
            iconsURL: 'https://totally.fake.url',
            templateURL: 'https://tottally.fake.template',
            icons: [
                {
                    name: '001-marker',
                    imageURL: 'https://fake.image.url',
                    imageTemplateURL:
                        'https://fake.image.url/api/icons/sets/{icon_set_name}/icons/{icon_name}@{icon_scale}-{r},{g},{b}.png',
                    iconSetName: 'default',
                    anchor: [0, 0],
                    size: [48, 48],
                },
                {
                    name: '002-circle',
                    imageURL: 'https://fake.image.url',
                    imageTemplateURL:
                        'https://fake.image.url/api/icons/sets/{icon_set_name}/icons/{icon_name}@{icon_scale}-{r},{g},{b}.png',
                    iconSetName: 'default',
                    anchor: [0, 0],
                    size: [48, 48],
                },
                {
                    name: '0003-square',
                    imageURL: 'https://fake.image.url',
                    imageTemplateURL:
                        'https://fake.image.url/api/icons/sets/{icon_set_name}/icons/{icon_name}@{icon_scale}-{r},{g},{b}.png',
                    iconSetName: 'default',
                    anchor: [0, 0],
                    size: [48, 48],
                },
            ],
        }
        const fakeBabsIconSet: DrawingIconSet = {
            name: 'babs',
            isColorable: false,
            hasDescription: true,
            language: 'en',
            iconsURL: 'https://another.fake.url',
            templateURL: 'https://another.fake.template',
            icons: [
                {
                    name: 'babs-3',
                    imageURL: 'https://fake.image.url',
                    imageTemplateURL:
                        'https://fake.image.url/api/icons/sets/{icon_set_name}/icons/{icon_name}@{icon_scale}-{r},{g},{b}.png',
                    iconSetName: 'babs',
                    anchor: [0, 0],
                    size: [48, 48],
                    description: {
                        en: 'BABS 3 icon',
                    },
                },
            ],
        }
        const fakeIconSets: DrawingIconSet[] = [fakeDefaultIconSet, fakeBabsIconSet]
        it('get icon with standard arguments from the set', () => {
            const icon = kmlUtils.getIcon(
                {
                    set: 'default',
                    name: '001-marker',
                    isLegacy: false,
                },
                undefined,
                fakeIconSets
            )
            expect(icon).toBeDefined()
            expect(icon.name).to.be.equal('001-marker')
            expect(icon.iconSetName).to.be.equal('default')
            expect(iconsAPI.generateIconURL(icon)).to.be.equal(
                'https://fake.image.url/api/icons/sets/default/icons/001-marker@1x-255,0,0.png'
            )
        })
        it('get icon with standard arguments from the set with color', () => {
            const icon = kmlUtils.getIcon(
                {
                    set: 'default',
                    name: '001-marker',
                    isLegacy: false,
                },
                undefined,
                fakeIconSets
            )
            expect(icon).toBeDefined()
            expect(icon.name).to.be.equal('001-marker')
            expect(icon.iconSetName).to.be.equal('default')
            expect(iconsAPI.generateIconURL(icon, '#123456')).to.be.equal(
                'https://fake.image.url/api/icons/sets/default/icons/001-marker@1x-18,52,86.png'
            )
        })
        it('get icon with standard arguments from the babs set', () => {
            const icon = kmlUtils.getIcon(
                {
                    set: 'babs',
                    name: 'babs-3',
                    isLegacy: false,
                },
                undefined,
                fakeIconSets
            )
            expect(icon).toBeDefined()
            expect(icon.name).to.be.equal('babs-3')
            expect(icon.iconSetName).to.be.equal('babs')
            expect(iconsAPI.generateIconURL(icon)).to.be.equal(
                'https://fake.image.url/api/icons/sets/babs/icons/babs-3@1x-255,0,0.png'
            )
        })
        it('get icon with standard arguments without sets and style', () => {
            const icon = kmlUtils.getIcon(
                {
                    set: 'default',
                    name: '001-marker',
                    isLegacy: false,
                },
                undefined,
                undefined
            )
            expect(icon).toBeUndefined()
        })
        it('get icon with standard arguments witout sets', () => {
            const icon = kmlUtils.getIcon(
                {
                    set: 'default',
                    name: '001-marker',
                    isLegacy: false,
                },
                new IconStyle({
                    src: 'https://fake.image.url/api/icons/sets/default/icons/001-marker@1x-255,0,0.png',
                })
            )
            expect(icon).toBeDefined()
            expect(icon.name).to.be.equal('001-marker')
            expect(icon.iconSetName).to.be.equal('default')
            expect(iconsAPI.generateIconURL(icon)).to.be.equal(
                'https://fake.image.url/api/icons/sets/default/icons/001-marker@1x-255,0,0.png'
            )
        })
        it('get legacy icon with standard arguments witout sets', () => {
            const icon = kmlUtils.getIcon(
                {
                    set: 'default',
                    name: 'star',
                    isLegacy: true,
                },
                new IconStyle({
                    src: 'https://api3.geo.admin.ch/color/45,600,800/star-24@2x.png',
                })
            )
            expect(icon).toBeDefined()
            expect(icon.name).to.be.equal('star')
            expect(icon.iconSetName).to.be.equal('default')
            expect(iconsAPI.generateIconURL(icon)).to.be.equal(
                'https://api3.geo.admin.ch/color/45,600,800/star-24@2x.png'
            )
        })
    })
    describe('isKml', () => {
        it('detects a simple KML file syntax correctly', () => {
            expect(kmlUtils.isKml('<kml>test</kml>')).to.be.true
        })
        it('can detect a KML file with a namespace prefix', () => {
            expect(kmlUtils.isKml('<kml:kml>test</kml:kml>')).to.be.true
        })
        it('can detect a KML file with a namespace prefix and a namespace declaration', () => {
            expect(kmlUtils.isKml('<?xml version="1.0" encoding="UTF-8"?><kml:kml>test</kml:kml>'))
                .to.be.true
        })
        it('handles carriage returns correctly', () => {
            expect(
                kmlUtils.isKml(
                    `<?xml version="1.0" encoding="UTF-8"?>
<kml:kml>
    test
</kml:kml>`
                )
            ).to.be.true
        })
        it('can handle a full KML sample correctly', () => {
            expect(
                kmlUtils.isKml(`
<kml>
    <Placemark>
        <name>test</name>
        <description>KML With Prefixed Namespace</description>
        <Point>
            <coordinates>7.438632503,46.951082887,598.947</coordinates>
        </Point>
    </Placemark>
</kml>`)
            ).to.be.true
        })
        it('rejects a tag with a typo at the end', () => {
            expect(kmlUtils.isKml('<kmlz>test</kmlz>')).to.be.false
        })
        it('rejects a tag with a typo in the middle', () => {
            expect(kmlUtils.isKml('<kmzl>test</kmzl>')).to.be.false
        })
        it('rejects a tag with a typo at the beginning', () => {
            expect(kmlUtils.isKml('<akml>test</akml>')).to.be.false
        })
        it('rejects a valid XML (but-non KML) input', () => {
            expect(kmlUtils.isKml('<?xml version="1.0" encoding="UTF-8"?><div>test</div>')).to.be
                .false
        })
        it('rejects a KML that is wrapped in a CDATA section', () => {
            expect(
                kmlUtils.isKml(`<div><![CDATA[
    <kml>
        <Placemark>
            <name>test</name>
            <description>KML With Prefixed Namespace</description>
            <Point>
                 <coordinates>7.438632503,46.951082887,598.947</coordinates>
            </Point>
        </Placemark>
    </kml>
]]></div>`)
            ).to.be.false
        })
    })
})
