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
    var worldPolygon = null
    // Hardcoded for now
    var printRectangle = [480, 230, 1440, 700]
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
            worldPolygon.on('postrender', (event) => {
                log.info(event)
                handlePostRender(event.context)
                updatePrintArea()
            }),
            watch(layoutName, () => {
                updatePrintArea()
                updatePrintRectanglePixels(scale)
            }),
            watch(scale, () => {
                updatePrintArea()
                updatePrintRectanglePixels(scale)
            }),
            map.on('change:size', () => {
                updatePrintRectanglePixels(scale)
            }),
            map.getView().on('propertychange', () => {
                updatePrintRectanglePixels(scale)
            }),
        ]
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
        log.info('scale', scale.value, s)
        // TODO(IS): this is still hard coded to A3 Landscape
        var size = {
            width: 1150,
            height: 777,
        }
        // var size = $scope.layout.map // papersize in dot!
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

    function updatePrintArea() {
        log.info(scale.value, layoutName.value)
    }

    function handlePostRender(context) {
        const size = map.getSize()

        var height = size[1] * olHas.DEVICE_PIXEL_RATIO,
            width = size[0] * olHas.DEVICE_PIXEL_RATIO

        // var minx = width * 0.25,
        //     miny = height * 0.25,
        //     maxx = width * 0.75,
        //     maxy = height * 0.75

        var minx = printRectangle[0],
            miny = printRectangle[1],
            maxx = printRectangle[2],
            maxy = printRectangle[3]

        log.info(minx, miny, maxx, maxy, height, width)

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
}
