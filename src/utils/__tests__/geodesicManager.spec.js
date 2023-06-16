import { HALFSIZE_WEBMERCATOR, GeodesicGeometries } from '@/utils/geodesicManager'
import { Feature } from 'ol'
import { expect } from 'chai'
import { LineString, MultiLineString, MultiPolygon } from 'ol/geom'
import { describe, it } from 'vitest'
import { Style } from 'ol/style'

function constructGeodLineString(...coords) {
    const feature = new Feature(new LineString(coords))
    feature.set('isDrawing', true)
    return new GeodesicGeometries(feature)
}

function checkCoordsEqual(coords1, coords2, precision) {
    expect(coords1).to.have.length(coords2.length)
    coords1.forEach((coord, i) => {
        expect(coord).to.have.length(2)
        expect(coords2[i]).to.have.length(2)
        expect(coord[0]).to.be.closeTo(coords2[i][0], precision ?? 0.0001)
        expect(coord[1]).to.be.closeTo(coords2[i][1], precision ?? 0.0001)
    })
}

function checkExtentEqual(extent, extent2) {
    expect(extent).to.have.length(4) //minX, minY, maxX, maxY
    for (let i = 0; i < 4; i++) {
        // not so high precision as we also append a buffer to each extent
        expect(extent[i]).to.be.closeTo(extent2[i], 0.01)
    }
}

function validateResults(geodesic, exp) {
    // Validate geodesicGeom
    const geom = geodesic.getGeodesicGeom()
    expect(geom).to.be.instanceOf(MultiLineString)
    expect(geom.getCoordinates()).to.have.length(exp.geodesicGeom.length)
    for (let i = 0; i < exp.geodesicGeom.length; i++) {
        expect(geom.getCoordinates()[i]).to.have.length(exp.geodesicGeom[i].length)
        checkCoordsEqual(geom.getCoordinates()[i], exp.geodesicGeom[i])
    }

    // Validate geodesicPolygonGeom
    const polygonGeom = geodesic.getGeodesicPolygonGeom()
    const expPolygonGeom =
        exp.geodesicPolygonGeom === undefined ? exp.geodesicGeom : exp.geodesicPolygonGeom
    if (expPolygonGeom) {
        expect(polygonGeom).to.be.instanceOf(MultiPolygon)
        expect(polygonGeom.getCoordinates()).to.have.length(expPolygonGeom.length) // nb polygons
        for (let i = 0; i < expPolygonGeom.length; i++) {
            expect(polygonGeom.getCoordinates()[i]).to.have.length(1) // 1 Subpolygon
            expect(polygonGeom.getCoordinates()[i][0]).to.have.length(expPolygonGeom[i].length + 1)
            checkCoordsEqual(polygonGeom.getCoordinates()[i][0], [
                ...expPolygonGeom[i],
                expPolygonGeom[i][0],
            ])
        }
    } else {
        expect(polygonGeom).to.be.null
    }

    //Validate number of style functions
    const styles = geodesic.getMeasureStyles(1)
    expect(styles).to.have.length(exp.maxStyles) // 4 measure points, azimuth circle, total length
    styles.forEach((style) => expect(style).to.be.instanceOf(Style))
    expect(geodesic.getMeasureStyles(100000)).to.have.length(exp.minStyles) // azimuth circle + total length

    //Validate segmentExtents
    exp.segmentExtents.forEach((extent, i) =>
        checkExtentEqual(geodesic.getSegmentExtent(i), extent)
    )
}

describe('Unit tests for Geodesic geometries', () => {
    it('test azimuth calculation', () => {
        expect(constructGeodLineString([0, 500], [0, 600]).rotation).to.equal(0)
        expect(constructGeodLineString([500, 10], [600, 10]).rotation.toFixed(2)).to.equal('90.00')
        expect(constructGeodLineString([600, 10], [500, 10]).rotation.toFixed(2)).to.equal('270.00')
        const line = constructGeodLineString([1064265.7618468616, 5882082.735211225])
        expect(line.rotation).to.equal(undefined)
    })
    it('Works with 0 coordinates', () => {
        const geodesic = constructGeodLineString()
        validateResults(geodesic, {
            geodesicGeom: [],
            maxStyles: 0,
            minStyles: 0,
            segmentExtents: [],
        })
    })
    it('Works with 1 coordinate', () => {
        const geodesic = constructGeodLineString([500, 400])
        validateResults(geodesic, {
            geodesicGeom: [],
            geodesicPolygonGeom: [[[500, 400]]],
            maxStyles: 0,
            minStyles: 0,
            segmentExtents: [],
        })
    })
    it('2 coordinates', () => {
        /* We are at the equator to easily check the algorithms, as at the
        equator one coordinate unit = one meter */
        const geodesic = constructGeodLineString([0, 0], [4500, 0])
        validateResults(geodesic, {
            geodesicGeom: [
                [
                    [0, 0],
                    [1000, 0],
                    [2000, 0],
                    [3000, 0],
                    [4000, 0],
                    [4500, 0],
                ],
            ],
            maxStyles: 6, // 4 measure points, azimuth circle, total length
            minStyles: 2, // azimuth circle + total length
            segmentExtents: [[0, 0, 4500, 0]],
        })

        // Validate getSubsegments
        const subsegments = geodesic.getSubsegments(0, [500, -0.0001, 2000, 0.0001])
        expect(subsegments).to.have.length(3) // [0-1000], [1000-2000], [2000-3000]
        checkCoordsEqual(subsegments[0], [
            [0, 0],
            [1000, 0],
        ])
        checkCoordsEqual(subsegments[1], [
            [1000, 0],
            [2000, 0],
        ])
        checkCoordsEqual(subsegments[2], [
            [2000, 0],
            [3000, 0],
        ])
    })
    it('2 identical coordinates', () => {
        /* We are at the equator to easily check the algorithms, as at the
        equator one coordinate unit = one meter */
        const geodesic = constructGeodLineString([0, 0], [0, 0])
        validateResults(geodesic, {
            geodesicGeom: [
                [
                    [0, 0],
                    [0, 0],
                ],
            ],
            maxStyles: 0,
            minStyles: 0,
            segmentExtents: [[0, 0, 0, 0]],
        })

        // Validate getSubsegments
        const subsegments = geodesic.getSubsegments(0, [-100, -0.001, 2000, 0.0001])
        expect(subsegments).to.have.length(1)
        checkCoordsEqual(subsegments[0], [
            [0, 0],
            [0, 0],
        ])
    })
    it('2 coordinates crossing the dateline', () => {
        /* We are at the equator to easily check the algorithms, as at the
        equator one coordinate unit = one meter */
        const geodesic = constructGeodLineString([HALFSIZE_WEBMERCATOR - 1500, 0], [-HALFSIZE_WEBMERCATOR + 2000, 0])
        validateResults(geodesic, {
            geodesicGeom: [
                [
                    [HALFSIZE_WEBMERCATOR - 1500, 0],
                    [HALFSIZE_WEBMERCATOR - 500, 0],
                    [HALFSIZE_WEBMERCATOR + 500, 0],
                ],
                [
                    [-HALFSIZE_WEBMERCATOR + 500, 0],
                    [-HALFSIZE_WEBMERCATOR + 1500, 0],
                    [-HALFSIZE_WEBMERCATOR + 2000, 0],
                ],
            ],
            geodesicPolygonGeom: null,
            maxStyles: 5, // 3 measure points, azimuth circle, total length
            minStyles: 2, // azimuth circle + total length
            segmentExtents: [[-HALFSIZE_WEBMERCATOR + 500, 0, HALFSIZE_WEBMERCATOR + 500, 0]],
        })

        // Validate getSubsegments
        const subsegments = geodesic.getSubsegments(0, [HALFSIZE_WEBMERCATOR, -0.0001, HALFSIZE_WEBMERCATOR, +0.0001])
        expect(subsegments).to.have.length(1) // [0-1000], [1000-2000], [2000-3000]
        checkCoordsEqual(subsegments[0], [
            [HALFSIZE_WEBMERCATOR - 500, 0],
            [HALFSIZE_WEBMERCATOR + 500, 0],
        ])
    })
    it('3 coordinates crossing the dateline', () => {
        /* We are at the equator to easily check the algorithms, as at the
        equator one coordinate unit = one meter */
        const geodesic = constructGeodLineString(
            [HALFSIZE_WEBMERCATOR - 1500, 0],
            [-HALFSIZE_WEBMERCATOR + 1100, 0],
            [-HALFSIZE_WEBMERCATOR + 2000, 0]
        )
        validateResults(geodesic, {
            geodesicGeom: [
                [
                    [HALFSIZE_WEBMERCATOR - 1500, 0],
                    [HALFSIZE_WEBMERCATOR - 500, 0],
                    [HALFSIZE_WEBMERCATOR + 500, 0],
                ],
                [
                    [-HALFSIZE_WEBMERCATOR + 500, 0],
                    [-HALFSIZE_WEBMERCATOR + 1100, 0],
                    [-HALFSIZE_WEBMERCATOR + 2000, 0],
                ],
            ],
            geodesicPolygonGeom: null,
            maxStyles: 4, // 3 measure points, total length
            minStyles: 1, // total length
            segmentExtents: [[-HALFSIZE_WEBMERCATOR + 500, 0, HALFSIZE_WEBMERCATOR + 500, 0]],
        })

        // Validate getSubsegments
        const subsegments = geodesic.getSubsegments(0, [
            -HALFSIZE_WEBMERCATOR + 1000 - 0.0001,
            -0.0001,
            -HALFSIZE_WEBMERCATOR + 1000,
            +0.0001,
        ])
        expect(subsegments).to.have.length(1)
        checkCoordsEqual(subsegments[0], [
            [-HALFSIZE_WEBMERCATOR + 500, 0],
            [-HALFSIZE_WEBMERCATOR + 1100, 0],
        ])
    })
})
