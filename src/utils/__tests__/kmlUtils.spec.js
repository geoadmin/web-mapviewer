import { expect } from 'chai'
import { describe, it } from 'vitest'

import { LV95 } from '@/utils/coordinates/coordinateSystems'
import { getKmlExtent, getKmlExtentForProjection } from '@/utils/kmlUtils'

describe('Test KML utils', () => {
    describe('get KML Extent', () => {
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
            const extent = getKmlExtent(content)

            expect(extent).to.deep.equal([8.117189, 46.852375, 8.117189, 46.852375])
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
            const extent = getKmlExtent(content)

            expect(extent).to.deep.equal([
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
            const extent = getKmlExtent(content)

            expect(extent).to.deep.equal([
                7.659940678339698, 46.75405886506746, 8.092263503513564, 46.96964910688379,
            ])
        })
    })
    describe('get KML Extent within projection bounds', () => {
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
            const extent = getKmlExtent(content)
            const projectedExtent = getKmlExtentForProjection(LV95, extent)

            expect(projectedExtent).to.deep.equal([
                [2651749.9748876626, 1189249.9890369223],
                [2651749.9748876626, 1189249.9890369223],
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
            const extent = getKmlExtent(content)
            const projectedExtent = getKmlExtentForProjection(LV95, extent)

            expect(projectedExtent).to.deep.equal([
                [2423458.972383674, 1147908.7345235168],
                [2902899.0399873387, 1293747.491178336],
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
            const extent = getKmlExtent(content)
            const projectedExtent = getKmlExtentForProjection(LV95, extent)

            expect(projectedExtent).to.deep.equal([
                [2616908.846006978, 1178120.7002258834],
                [2649740.5472833975, +1202270.7737464283],
            ])
        })
    })
})
