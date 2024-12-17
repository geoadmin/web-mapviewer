import { Cesium3DTileStyle } from 'cesium'

/**
 * Custom style for our tileset ch.swisstopo.swissnames3d.3d.
 *
 * @type {module:cesium.Cesium3DTileStyle}
 */
export const CESIUM_SWISSNAMES3D_STYLE = new Cesium3DTileStyle({
    show: true,
    labelStyle: 2,
    labelText: '${DISPLAY_TEXT}',
    // no depth test for labels
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    anchorLineEnabled: true,
    anchorLineColor: "color('white')",
    heightOffset: {
        conditions: [
            ['${LOD} === "7"', 20],
            ['${LOD} === "6"', 40],
            ['${LOD} === "5"', 60],
            ['${LOD} === "4"', 80],
            ['${LOD} === "3"', 100],
            ['${LOD} === "2"', 120],
            ['${LOD} === "1"', 150],
            ['${LOD} === "0"', 200],
            ['true', '200'],
        ],
    },
    labelColor: {
        conditions: [
            ['${OBJEKTART} === "See"', 'color("blue")'],
            ['true', 'color("black")'],
        ],
    },
    labelOutlineColor: 'color("white", 1)',
    labelOutlineWidth: 5,
    font: {
        conditions: [
            ['${OBJEKTART} === "See"', '"bold 32px arial"'],
            ['${OBJEKTART} === "Alpiner Gipfel"', '"italic 32px arial"'],
            ['true', '" 32px arial"'],
        ],
    },
    scaleByDistance: {
        conditions: [
            ['${LOD} === "7"', 'vec4(1000, 1, 5000, 0.4)'],
            ['${LOD} === "6"', 'vec4(1000, 1, 5000, 0.4)'],
            ['${LOD} === "5"', 'vec4(1000, 1, 8000, 0.4)'],
            ['${LOD} === "4"', 'vec4(1000, 1, 10000, 0.4)'],
            ['${LOD} === "3"', 'vec4(1000, 1, 20000, 0.4)'],
            ['${LOD} === "2"', 'vec4(1000, 1, 30000, 0.4)'],
            ['${LOD} === "1"', 'vec4(1000, 1, 50000, 0.4)'],
            ['${LOD} === "0"', 'vec4(1000, 1, 500000, 0.4)'],
            ['true', 'vec4(1000, 1, 10000, 0.4)'],
        ],
    },
    translucencyByDistance: {
        conditions: [
            ['${LOD} === "7"', 'vec4(5000, 1, 5001, 1)'],
            ['${LOD} === "6"', 'vec4(5000, 1, 5001, 1)'],
            ['${LOD} === "5"', 'vec4(5000, 1, 8000, 0.4)'],
            ['${LOD} === "4"', 'vec4(5000, 1, 10000, 0.4)'],
            ['${LOD} === "3"', 'vec4(5000, 1, 20000, 0.4)'],
            ['${LOD} === "2"', 'vec4(5000, 1, 30000, 0.4)'],
            ['${LOD} === "1"', 'vec4(5000, 1, 50000, 0.4)'],
            ['${LOD} === "0"', 'vec4(5000, 1, 500000, 1)'],
            ['true', 'vec4(5000, 1, 10000, 0.5)'],
        ],
    },
    distanceDisplayCondition: {
        conditions: [
            ['${LOD} === "7"', 'vec2(0, 5000)'],
            ['${LOD} === "6"', 'vec2(0, 5000)'],
            ['${LOD} === "5"', 'vec2(0, 8000)'],
            ['${LOD} === "4"', 'vec2(0, 10000)'],
            ['${LOD} === "3"', 'vec2(0, 20000)'],
            ['${LOD} === "2"', 'vec2(0, 30000)'],
            ['${LOD} === "1"', 'vec2(0, 50000)'],
            ['${LOD} === "0"', 'vec2(0, 500000)'],
            ['${OBJEKTART} === "Alpiner Gipfel"', 'vec2(0, 100000)'],
        ],
    },
})
