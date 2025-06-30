import { WEBMERCATOR } from '@geoadmin/coordinates'
import { LayerType } from '@geoadmin/layers'
import { expect } from 'chai'
import { readFileSync } from 'fs'
import IconStyle from 'ol/style/Icon'
import { resolve } from 'path'
import { beforeEach, describe, it } from 'vitest'

import { DrawingIcon, DrawingIconSet } from '@/api/icon.api'
import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import { fakeIconSets } from '@/utils/__tests__/legacyKmlUtils.spec.js'
import { BLUE } from '@/utils/featureStyleUtils'
import { makeKmlLayer } from '@/utils/kmlUtils'
import { getIcon, getKmlExtent, parseIconUrl, parseKml } from '@/utils/kmlUtils'

import { isKmlFeaturesValid } from '../kmlUtils'

describe('Test KML utils', () => {
    describe('get KML Extent', () => {
        it('handles correctly invalid inputs', () => {
            expect(getKmlExtent()).to.be.null
            expect(getKmlExtent(null)).to.be.null
            expect(getKmlExtent(0)).to.be.null
            expect(getKmlExtent([])).to.be.null
            expect(getKmlExtent({})).to.be.null
            expect(getKmlExtent('')).to.be.null
        })
        it('returns null if the KML has no feature', () => {
            const emptyDocument = `<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
                <Document>
                </Document>
            </kml>
            `
            expect(getKmlExtent(emptyDocument)).to.be.null
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
            expect(getKmlExtent(content)).to.deep.equal([8.117189, 46.852375, 8.117189, 46.852375])
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
            expect(getKmlExtent(content)).to.deep.equal([
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
            expect(getKmlExtent(content)).to.deep.equal([
                7.659940678339698, 46.75405886506746, 8.092263503513564, 46.96964910688379,
            ])
        })
    })
    describe('isKmlFeaturesValid', () => {
        it('returns false if there is an error in the features of the KML', () => {
            const kml = readFileSync(resolve(__dirname, './kml_feature_error.kml'), 'utf8')
            const result = isKmlFeaturesValid(kml)
            expect(result).to.be.false
        })
        it('returns true if there is no error in the features of the KML', () => {
            const kml = readFileSync(resolve(__dirname, './webmapviewerOffsetTestKml.kml'), 'utf8')
            const result = isKmlFeaturesValid(kml)
            expect(result).to.be.true
        })
    })
    describe('get marker title offset', () => {
        let features = []
        function findFeatureWithId(featureId) {
            return features.find((feature) => feature.id === featureId)
        }

        beforeEach(() => {
            const kml = readFileSync(resolve(__dirname, './webmapviewerOffsetTestKml.kml'), 'utf8')
            const kmlLayer = makeKmlLayer({
                kmlFileUrl: getServiceKmlBaseUrl(), // so that it is not considered external
                kmlData: kml,
            })
            const olFeatures = parseKml(kmlLayer, WEBMERCATOR, fakeIconSets)
            features = olFeatures.map((f) => {
                const ef = f.get('editableFeature')
                ef.olFeature = f
                return ef
            })
        })
        it('handles correctly text offset from extended data', () => {
            const icon = findFeatureWithId('drawing_feature_1714651153088')
            expect(icon.textOffset).to.deep.equal([0, -44.75])
        })
        it('handles correctly text offset if no offset provided', () => {
            const icon = findFeatureWithId('drawing_feature_1714651899088')
            expect(icon.textOffset).to.deep.equal([0, 0])
        })
    })
    describe('parseIconUrl', () => {
        it('parse a new icon url of a default set', () => {
            const args = parseIconUrl(
                'https://sys-map.dev.bgdi.ch/api/icons/sets/default/icons/001-marker@1.5x-0,128,0.png'
            )
            expect(args).to.be.not.null.and.to.be.not.undefined
            expect(args.set).to.be.equal('default')
            expect(args.name).to.be.equal('001-marker')
            expect(args.color).to.be.not.null.and.to.be.not.undefined
            expect(args.color.r).to.be.equal(0)
            expect(args.color.g).to.be.equal(128)
            expect(args.color.b).to.be.equal(0)
            expect(args.isLegacy).to.be.false
        })
        it('parse a new icon url of a default set with invalid color', () => {
            const args = parseIconUrl(
                'https://sys-map.dev.bgdi.ch/api/icons/sets/default/icons/001-marker@4x-0,600,0.png'
            )
            expect(args).to.be.not.null.and.to.be.not.undefined
            expect(args.set).to.be.equal('default')
            expect(args.name).to.be.equal('001-marker')
            expect(args.color).to.be.not.null.and.to.be.not.undefined
            expect(args.color.r).to.be.equal(0)
            expect(args.color.g).to.be.equal(255)
            expect(args.color.b).to.be.equal(0)
            expect(args.isLegacy).to.be.false
        })
        it('parse a new icon url of a default set with no number color', () => {
            const args = parseIconUrl(
                'https://sys-map.dev.bgdi.ch/api/icons/sets/default/icons/001-marker@1.5x-0,600,a.png'
            )
            expect(args).to.be.null
        })
        it('parse a new icon url of a babs set', () => {
            const args = parseIconUrl(
                'https://sys-map.dev.bgdi.ch/api/icons/sets/babs/icons/babs-100@1x-255,128,3.png'
            )
            expect(args).to.be.not.null.and.to.be.not.undefined
            expect(args.set).to.be.equal('babs')
            expect(args.name).to.be.equal('babs-100')
            expect(args.color).to.be.not.null.and.to.be.not.undefined
            expect(args.color.r).to.be.equal(255)
            expect(args.color.g).to.be.equal(128)
            expect(args.color.b).to.be.equal(3)
            expect(args.isLegacy).to.be.false
        })
        it('parse a new icon standard url of a default set (no scale no color)', () => {
            const args = parseIconUrl(
                'https://map.geo.admin.ch/api/icons/sets/my-set/icons/my-icon.png'
            )
            expect(args).to.be.null
        })
        it('parse a new icon url of a default set without scale', () => {
            const args = parseIconUrl(
                'https://map.geo.admin.ch/api/icons/sets/my-set/icons/my-icon-255,0,0.png'
            )
            expect(args).to.be.null
        })
        it('parse a new icon url of a default set without color', () => {
            const args = parseIconUrl(
                'https://map.geo.admin.ch/api/icons/sets/my-set/icons/my-icon@1.5x.png'
            )
            expect(args).to.be.null
        })
        it('parse a legacy icon url of a default set', () => {
            const args = parseIconUrl('https://api3.geo.admin.ch/color/45,128,23/star-24@2x.png')
            expect(args).to.be.not.null.and.to.be.not.undefined
            expect(args.set).to.be.equal('default')
            expect(args.name).to.be.equal('star')
            expect(args.color).to.be.not.null.and.to.be.not.undefined
            expect(args.color.r).to.be.equal(45)
            expect(args.color.g).to.be.equal(128)
            expect(args.color.b).to.be.equal(23)
            expect(args.isLegacy).to.be.true
        })
        it('parse a legacy icon url of a default set with invalid color', () => {
            const args = parseIconUrl('https://api3.geo.admin.ch/color/45,600,800/star-24@2x.png')
            expect(args).to.be.not.null.and.to.be.not.undefined
            expect(args.set).to.be.equal('default')
            expect(args.name).to.be.equal('star')
            expect(args.color).to.be.not.null.and.to.be.not.undefined
            expect(args.color.r).to.be.equal(45)
            // invalid color fallback to 255
            expect(args.color.g).to.be.equal(255)
            expect(args.color.b).to.be.equal(255)
            expect(args.isLegacy).to.be.true
        })
        it('parse a legacy icon url of a default set with non number color', () => {
            const args = parseIconUrl('https://api3.geo.admin.ch/color/45,a,800/star-24@2x.png')
            expect(args).to.be.null
        })
        it('parse a legacy icon url of a babs set', () => {
            const args = parseIconUrl('https://sys-api3.dev.bgdi.ch/images/babs/babs-76.png')
            expect(args).to.be.not.null.and.to.be.not.undefined
            expect(args.set).to.be.equal('babs')
            expect(args.name).to.be.equal('babs-76')
            // expect default scale and color
            expect(args.color.r).to.be.equal(255)
            expect(args.color.g).to.be.equal(0)
            expect(args.color.b).to.be.equal(0)
            expect(args.isLegacy).to.be.true
        })
    })
    describe('getIcon', () => {
        const fakeDefaultIconSet = new DrawingIconSet(
            'default',
            true,
            'https://totally.fake.url',
            'https://tottally.fake.template'
        )
        // adding the 3 icons from the default set
        fakeDefaultIconSet.icons = [
            new DrawingIcon(
                '001-marker',
                'https://fake.image.url',
                'https://fake.image.url/api/icons/sets/{icon_set_name}/icons/{icon_name}@{icon_scale}-{r},{g},{b}.png',
                'default',
                [0, 0]
            ),
            new DrawingIcon(
                '002-circle',
                'https://fake.image.url',
                'https://fake.image.url/api/icons/sets/{icon_set_name}/icons/{icon_name}@{icon_scale}-{r},{g},{b}.png',
                'default',
                [0, 0]
            ),
            new DrawingIcon(
                '0003-square',
                'https://fake.image.url',
                'https://fake.image.url/api/icons/sets/{icon_set_name}/icons/{icon_name}@{icon_scale}-{r},{g},{b}.png',
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
                'https://fake.image.url/api/icons/sets/{icon_set_name}/icons/{icon_name}@{icon_scale}-{r},{g},{b}.png',
                'babs',
                [0, 0]
            ),
        ]
        const fakeIconSets = [fakeDefaultIconSet, fakeBabsIconSet]
        it('get icon with standard arguments from the set', () => {
            const icon = getIcon(
                {
                    set: 'default',
                    name: '001-marker',
                    isLegacy: false,
                },
                null,
                fakeIconSets
            )
            expect(icon).to.be.not.null.and.not.undefined
            expect(icon.name).to.be.equal('001-marker')
            expect(icon.iconSetName).to.be.equal('default')
            expect(icon.generateURL()).to.be.equal(
                'https://fake.image.url/api/icons/sets/default/icons/001-marker@1x-255,0,0.png'
            )
        })
        it('get icon with standard arguments from the set with scale and color', () => {
            const icon = getIcon(
                {
                    set: 'default',
                    name: '001-marker',
                    isLegacy: false,
                },
                null,
                fakeIconSets
            )
            expect(icon).to.be.not.null.and.not.undefined
            expect(icon.name).to.be.equal('001-marker')
            expect(icon.iconSetName).to.be.equal('default')
            expect(icon.generateURL(BLUE, 1.5)).to.be.equal(
                'https://fake.image.url/api/icons/sets/default/icons/001-marker@1.5x-0,0,255.png'
            )
        })
        it('get icon with standard arguments from the babs set', () => {
            const icon = getIcon(
                {
                    set: 'babs',
                    name: 'babs-3',
                    isLegacy: false,
                },
                null,
                fakeIconSets
            )
            expect(icon).to.be.not.null.and.not.undefined
            expect(icon.name).to.be.equal('babs-3')
            expect(icon.iconSetName).to.be.equal('babs')
            expect(icon.generateURL()).to.be.equal(
                'https://fake.image.url/api/icons/sets/babs/icons/babs-3@1x-255,0,0.png'
            )
        })
        it('get icon with standard arguments without sets and style', () => {
            const icon = getIcon(
                {
                    set: 'default',
                    name: '001-marker',
                    isLegacy: false,
                },
                null,
                null
            )
            expect(icon).to.be.null
        })
        it('get icon with standard arguments witout sets', () => {
            const icon = getIcon(
                {
                    set: 'default',
                    name: '001-marker',
                    isLegacy: false,
                },
                new IconStyle({
                    src: 'https://fake.image.url/api/icons/sets/default/icons/001-marker@1x-255,0,0.png',
                })
            )
            expect(icon).to.be.not.null.and.not.undefined
            expect(icon.name).to.be.equal('001-marker')
            expect(icon.iconSetName).to.be.equal('default')
            expect(icon.generateURL()).to.be.equal(
                'https://fake.image.url/api/icons/sets/default/icons/001-marker@1x-255,0,0.png'
            )
        })
        it('get legacy icon with standard arguments witout sets', () => {
            const icon = getIcon(
                {
                    set: 'default',
                    name: 'star',
                    isLegacy: true,
                },
                new IconStyle({
                    src: 'https://api3.geo.admin.ch/color/45,600,800/star-24@2x.png',
                })
            )
            expect(icon).to.be.not.null.and.not.undefined
            expect(icon.name).to.be.equal('star')
            expect(icon.iconSetName).to.be.equal('default')
            expect(icon.generateURL()).to.be.equal(
                'https://api3.geo.admin.ch/color/45,600,800/star-24@2x.png'
            )
        })
    })
    describe('Test KML factory wrapper', () => {
        const minimalKml = `
    <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
        </Document>
    </kml>`

        it('Instantiates a KML Layer correctly with minimal input', () => {
            // TODO check this behaviour with the trailing slash
            const serviceKmlBaseUrl = 'https://sys-public.dev.bgdi.ch/'
            const kmlLayer = makeKmlLayer({
                kmlFileUrl: serviceKmlBaseUrl,
                kmlData: minimalKml,
            })

            expect(kmlLayer.name).to.equal('KML')
            expect(kmlLayer.id).to.equal(serviceKmlBaseUrl)
            expect(kmlLayer.type).to.equal(LayerType.KML)
            expect(kmlLayer.opacity).to.equal(1.0)
            expect(kmlLayer.isVisible).to.equal(true)
            expect(kmlLayer.attributions).to.deep.equal([{ name: 'sys-public.dev.bgdi.ch' }])
            expect(kmlLayer.clampToGround).to.equal(true)
            expect(kmlLayer.fileId).to.equal('')
            expect(kmlLayer.style).to.equal('GEOADMIN')
            expect(kmlLayer.isExternal).to.equal(false)
        })
        it("Instantiates a KML layer that's a file, not a URL", () => {
            const kmlLayer = makeKmlLayer({
                kmlFileUrl: 'some-drawing-that-is-local.kml',
                kmlData: minimalKml,
            })

            expect(kmlLayer.name).to.equal('some-drawing-that-is-local.kml')
            expect(kmlLayer.isLocalFile).to.equal(true)
            expect(kmlLayer.fileId).to.equal(null)
            expect(kmlLayer.attributions).to.deep.equal([
                { name: 'some-drawing-that-is-local.kml' },
            ])
            expect(kmlLayer.isExternal).to.equal(true)
        })
        it('Instantiates an external KML drawing correctly', () => {
            const drawingUrl = 'https://sys-public.dev.bgdi.ch/api/kml/files/IaZVgxGDQcezO9iC9-Jjrw'
            const kmlLayer = makeKmlLayer({
                kmlFileUrl: drawingUrl,
                kmlData: minimalKml,
            })

            expect(kmlLayer.name).to.equal('IaZVgxGDQcezO9iC9-Jjrw')
            expect(kmlLayer.fileId).to.equal('IaZVgxGDQcezO9iC9-Jjrw')
            expect(kmlLayer.type).to.equal(LayerType.KML)
            expect(kmlLayer.isExternal).to.equal(false)
            expect(kmlLayer.clampToGround).to.equal(true)
        })
    })
})
