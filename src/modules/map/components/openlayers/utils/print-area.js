import { Feature } from 'ol'
import { Polygon } from 'ol/geom'
import * as olHas from 'ol/has'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, watch } from 'vue'
import { useStore } from 'vuex'

import log from '@/utils/logging'

function createWorldPolygon() {
    // Create a polygon feature covering the whole world in EPSG:4326
    var worldPolygon = new Feature({
        geometry: new Polygon([
            [
                [-180, -90], // Bottom-left corner
                [180, -90], // Bottom-right corner
                [180, 90], // Top-right corner
                [-180, 90], // Top-left corner
                [-180, -90], // Bottom-left corner
            ],
        ]).transform('EPSG:4326', 'EPSG:3857'),
    })
    // Create a VectorLayer outside the map creation
    var vectorLayer = new VectorLayer({
        source: new VectorSource({
            features: [worldPolygon],
        }),
    })
    return vectorLayer
}

export default function usePrintArea(map) {
    const store = useStore()
    var deregister = []
    var POINTS_PER_INCH = 72 // PostScript points 1/72"
    var MM_PER_INCHES = 25.4
    var UNITS_RATIO = 39.37 // inches per meter
    var worldPolygon = null
    var printRectangle = []
    const isActive = computed(() => {
        return store.state.print.printSectionShown
    })

    const layoutName = computed(() => {
        return store.state.print.selectedLayout.name
    })

    const scale = computed(() => {
        return store.state.print.selectedScale
    })

    watch(isActive, (newValue) => {
        if (newValue) {
            activatePrintArea()
        } else {
            deactivatePrintArea()
        }
    })

    function activatePrintArea() {
        log.info('activate print area')
        if (!worldPolygon) {
            worldPolygon = createWorldPolygon()
        }
        map.addLayer(worldPolygon)
        deregister = [
            worldPolygon.on('prerender', handlePreRender),
            worldPolygon.on('postrender', handlePostRender),
            watch(layoutName, () => {
                updatePrintRectanglePixels(scale)
            }),
            watch(scale, () => {
                updatePrintRectanglePixels(scale)
            }),
            map.on('change:size', () => {
                updatePrintRectanglePixels(scale)
            }),
            map.getView().on('propertychange', () => {
                updatePrintRectanglePixels(scale)
            }),
        ]
        store.commit('setSelectedScale', getOptimalScale())
        refreshComp()
    }

    function deactivatePrintArea() {
        log.info('deactivate print area')
        map.removeLayer(worldPolygon)
        while (deregister.length > 0) {
            var item = deregister.pop()
            if (typeof item === 'function') {
                item()
            } else {
                item.target.un(item.type, item.listener)
            }
        }
        refreshComp()
    }

    function refreshComp() {
        updatePrintRectanglePixels(scale)
        map.render()
    }

    function updatePrintRectanglePixels(scale) {
        if (isActive.value) {
            printRectangle = calculatePageBoundsPixels(scale)
            map.render()
        }
    }

    function calculatePageBoundsPixels(scale) {
        var s = parseFloat(scale.value)
        var size = store.getters.mapSize
        var view = map.getView()
        var resolution = view.getResolution()
        var w =
            (((((size.width / POINTS_PER_INCH) * MM_PER_INCHES) / 1000.0) * s) / resolution) *
            olHas.DEVICE_PIXEL_RATIO
        var h =
            (((((size.height / POINTS_PER_INCH) * MM_PER_INCHES) / 1000.0) * s) / resolution) *
            olHas.DEVICE_PIXEL_RATIO
        var mapSize = map.getSize()
        var center = [
            (mapSize[0] * olHas.DEVICE_PIXEL_RATIO) / 2,
            (mapSize[1] * olHas.DEVICE_PIXEL_RATIO) / 2,
        ]

        var minx, miny, maxx, maxy

        minx = center[0] - w / 2
        miny = center[1] - h / 2
        maxx = center[0] + w / 2
        maxy = center[1] + h / 2
        return [minx, miny, maxx, maxy]
    }

    // Compose events
    function handlePreRender(event) {
        var context = event.context
        context.save()
    }
    function handlePostRender(event) {
        var context = event.context
        const size = map.getSize()

        var height = size[1] * olHas.DEVICE_PIXEL_RATIO,
            width = size[0] * olHas.DEVICE_PIXEL_RATIO

        var minx = printRectangle[0],
            miny = printRectangle[1],
            maxx = printRectangle[2],
            maxy = printRectangle[3]

        context.save()

        context.beginPath()
        // Outside polygon, must be clockwise
        context.moveTo(0, 0)
        context.lineTo(width, 0)
        context.lineTo(width, height)
        context.lineTo(0, height)
        context.lineTo(0, 0)
        context.closePath()

        // Inner polygon,must be counter-clockwise
        context.moveTo(minx, miny)
        context.lineTo(minx, maxy)
        context.lineTo(maxx, maxy)
        context.lineTo(maxx, miny)
        context.lineTo(minx, miny)
        context.closePath()

        context.fillStyle = 'rgba(0, 5, 25, 0.75)'
        context.fill()

        context.restore()
    }

    function getOptimalScale() {
        log.info('getOptimalScale')
        var size = map.getSize()
        var resolution = map.getView().getResolution()
        // TODO(IS): hardcoded for now
        var widthMargin = 100
        var heightMargin = 100
        var width = resolution * (size[0] - widthMargin * 2)
        var height = resolution * (size[1] - heightMargin * 2)
        var layoutSize = store.getters.mapSize
        var scaleWidth = (width * UNITS_RATIO * POINTS_PER_INCH) / layoutSize.width
        var scaleHeight = (height * UNITS_RATIO * POINTS_PER_INCH) / layoutSize.height
        var testScale = scaleWidth
        if (scaleHeight < testScale) {
            testScale = scaleHeight
        }
        var nextBiggest = null
        var selectedLayoutScales = Array.from(store.state.print.selectedLayout.scales)
        // Make sure it's sorted ascending
        selectedLayoutScales.sort((a, b) => a - b)
        selectedLayoutScales.forEach(function (scale) {
            if (nextBiggest == null || testScale > scale) {
                nextBiggest = scale
            }
        })
        return nextBiggest
    }
}
