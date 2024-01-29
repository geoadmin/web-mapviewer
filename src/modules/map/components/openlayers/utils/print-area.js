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
    var worldPolygon = null
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
            }),
            watch(scale, () => {
                updatePrintArea()
            }),
        ]
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

    function updatePrintArea() {
        log.info(scale.value, layoutName.value)
    }

    function handlePostRender(context) {
        const size = map.getSize()

        var height = size[1] * olHas.DEVICE_PIXEL_RATIO,
            width = size[0] * olHas.DEVICE_PIXEL_RATIO

        var minx = width * 0.25,
            miny = height * 0.25,
            maxx = width * 0.75,
            maxy = height * 0.75

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
