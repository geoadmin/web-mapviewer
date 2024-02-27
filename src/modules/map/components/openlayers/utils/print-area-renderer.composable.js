import {
    BaseCustomizer,
    cancelPrint,
    getDownloadUrl,
    MFPEncoder,
    requestReport,
} from '@geoblocks/mapfishprint'
import { Feature } from 'ol'
import { Polygon } from 'ol/geom'
import * as olHas from 'ol/has'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, Style } from 'ol/style'
import { computed, watch } from 'vue'
import { useStore } from 'vuex'

import { getGenerateQRCodeUrl } from '@/api/qrcode.api'
import { API_BASE_URL, API_SERVICES_BASE_URL, WMS_BASE_URL } from '@/config'
import i18n from '@/modules/i18n'
import store from '@/store'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'print-area-renderer.composable' }

function createWorldPolygon() {
    // Create a polygon feature covering the whole world in EPSG:4326
    const worldPolygon = new Feature({
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

    // Define a transparent style for the polygon
    const transparentStyle = new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0)',
        }),
    })

    // Create a VectorLayer outside the map creation
    const vectorLayer = new VectorLayer({
        source: new VectorSource({
            features: [worldPolygon],
        }),
        style: transparentStyle,
    })
    return vectorLayer
}

function encodeGraticule(dpi, projection) {
    log.info('Encode graticule for projection:', projection)
    let gridLayer = 'org.epsg.grid_2056'
    if (projection.value instanceof CustomCoordinateSystem) {
        gridLayer = 'org.epsg.grid_2056'
    }
    return {
        baseURL: WMS_BASE_URL,
        opacity: 1,
        singleTile: true,
        type: 'WMS',
        layers: [gridLayer],
        format: 'image/png',
        styles: [''],
        customParams: {
            TRANSPARENT: true,
            MAP_RESOLUTION: dpi,
        },
    }
}

function encodeLegend() {
    const icons = []
    const visibleLayers = store.getters.visibleLayers

    for (const layer of visibleLayers) {
        if (layer.hasLegend) {
            icons.push(
                `${API_BASE_URL}/static/images/legends/${layer.getID()}_${store.state.i18n.lang}.png`
            )
        }
    }
    return {
        name: '',
        classes: [
            {
                name: i18n.global.t('legend'),
                icons: icons,
            },
        ],
    }
}

function encodeAttributions() {
    const visibleLayers = store.getters.visibleLayers
    const attributions = new Set()

    for (const layer of visibleLayers) {
        const layerAttributions = layer.attributions
        for (const layerAttribution of layerAttributions) {
            attributions.add(layerAttribution.name)
        }
    }
    return Array.from(attributions).join(', ')
}

export default function usePrintAreaRenderer(map) {
    const store = useStore()

    let deregister = []
    const POINTS_PER_INCH = 72 // PostScript points 1/72"
    const MM_PER_INCHES = 25.4
    const UNITS_RATIO = 39.37 // inches per meter
    let worldPolygon = null
    let printRectangle = []

    const isActive = computed(() => {
        return store.state.print.printSectionShown
    })

    const selectedLayoutName = computed(() => {
        return store.state.print.selectedLayout.name
    })

    const selectedScale = computed(() => {
        return store.state.print.selectedScale
    })

    const printingStatus = computed(() => {
        return store.state.print.printingStatus
    })

    watch(isActive, (newValue) => {
        if (newValue) {
            activatePrintArea()
        } else {
            deactivatePrintArea()
        }
    })

    watch(printingStatus, async (newValue) => {
        if (newValue) {
            startPrinting()
        } else {
            await abortPrinting()
        }
    })

    async function startPrinting() {
        const mapFishPrintUrl = API_SERVICES_BASE_URL + 'print3/print/default'

        const layout = store.state.print.selectedLayout.name

        const encoder = new MFPEncoder(mapFishPrintUrl)
        const customizer = new BaseCustomizer([0, 0, 10000, 10000])
        // Generate QR code url from current shortlink
        await store.dispatch('generateShortLinks', {
            withCrosshair: this.isTrackingGeolocation,
            ...dispatcher,
        })
        const shortLink = store.state.share.shortLink
        const qrCodeUrl = getGenerateQRCodeUrl(shortLink)

        const mapConfig = {
            map,
            scale: selectedScale.value,
            printResolution: 96,
            dpi: 96,
            customizer: customizer,
        }

        const mapSpec = await encoder.encodeMap(mapConfig)

        const spec = {
            attributes: {
                map: mapSpec,
                copyright: `© ${encodeAttributions()}`,
                url: store.state.ui.hostname,
                qrimage: qrCodeUrl,
            },
            format: 'pdf',
            layout: layout,
        }
        if (store.getters.useGraticule) {
            const legend = encodeLegend()
            spec.attributes.legend = legend
        } else {
            spec.attributes.printLegend = 0
        }

        if (store.state.print.useGraticule) {
            // Put the graticule in the first layer so it's drawn at the top
            spec.attributes.map.layers.unshift(encodeGraticule(96, store.state.position.projection))
        }

        const report = await requestReport(mapFishPrintUrl, spec)
        store.dispatch('setCurrentPrintReference', { reference: report.ref, ...dispatcher })

        await getDownloadUrl(mapFishPrintUrl, report, 1000)
            .then(
                (url) => {
                    downloadUrl(url)
                    return url
                },
                (err) => {
                    log.error('result', 'error', err)
                    return err
                }
            )
            .finally(() => {
                store.dispatch('setPrintingStatus', { isPrinting: false, ...dispatcher })
                store.dispatch('setCurrentPrintReference', { reference: null, ...dispatcher })
            })
    }

    async function abortPrinting() {
        if (store.getters.currentPrintReference) {
            const printReference = store.getters.currentPrintReference
            const mapFishPrintUrl = API_SERVICES_BASE_URL + 'print3/print/default'
            cancelPrint(mapFishPrintUrl, printReference)

            store.dispatch('setCurrentPrintReference', { reference: null, ...dispatcher })
        }
    }

    function downloadUrl(url) {
        if (window.navigator.userAgent.indexOf('MSIE ') > -1) {
            window.open(url)
        } else {
            window.location = url
        }
    }

    function activatePrintArea() {
        if (!worldPolygon) {
            worldPolygon = createWorldPolygon()
        }
        map.addLayer(worldPolygon)
        deregister = [
            worldPolygon.on('prerender', handlePreRender),
            worldPolygon.on('postrender', handlePostRender),
            watch(selectedLayoutName, () => {
                updatePrintRectanglePixels(selectedScale)
            }),
            watch(selectedScale, () => {
                updatePrintRectanglePixels(selectedScale)
            }),
            map.on('change:size', () => {
                updatePrintRectanglePixels(selectedScale)
            }),
            map.getView().on('propertychange', () => {
                updatePrintRectanglePixels(selectedScale)
            }),
        ]
        store.dispatch('setSelectedScale', { scale: getOptimalScale(), ...dispatcher })
        refreshComp()
    }

    function deactivatePrintArea() {
        map.removeLayer(worldPolygon)
        while (deregister.length > 0) {
            const item = deregister.pop()
            if (typeof item === 'function') {
                item()
            } else {
                item.target.un(item.type, item.listener)
            }
        }
        refreshComp()
    }

    function refreshComp() {
        updatePrintRectanglePixels(selectedScale)
        map.render()
    }

    function updatePrintRectanglePixels(scale) {
        if (isActive.value) {
            printRectangle = calculatePageBoundsPixels(scale)
            map.render()
        }
    }

    function calculatePageBoundsPixels(scale) {
        const s = parseFloat(scale.value)
        const size = store.getters.mapSize
        const view = map.getView()
        const resolution = view.getResolution()
        const w =
            (((((size.width / POINTS_PER_INCH) * MM_PER_INCHES) / 1000.0) * s) / resolution) *
            olHas.DEVICE_PIXEL_RATIO
        const h =
            (((((size.height / POINTS_PER_INCH) * MM_PER_INCHES) / 1000.0) * s) / resolution) *
            olHas.DEVICE_PIXEL_RATIO
        const mapSize = map.getSize()
        const center = [
            (mapSize[0] * olHas.DEVICE_PIXEL_RATIO) / 2,
            (mapSize[1] * olHas.DEVICE_PIXEL_RATIO) / 2,
        ]

        const minx = center[0] - w / 2
        const miny = center[1] - h / 2
        const maxx = center[0] + w / 2
        const maxy = center[1] + h / 2
        return [minx, miny, maxx, maxy]
    }

    // Compose events
    function handlePreRender(event) {
        const context = event.context
        context.save()
    }
    function handlePostRender(event) {
        // This is where we draw the print area rectangle using the worldPolygon
        const context = event.context
        const size = map.getSize()

        const height = size[1] * olHas.DEVICE_PIXEL_RATIO
        const width = size[0] * olHas.DEVICE_PIXEL_RATIO

        const minx = printRectangle[0]
        const miny = printRectangle[1]
        const maxx = printRectangle[2]
        const maxy = printRectangle[3]

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

    // Compute the optimal scale based on the map size (layout), resolution,
    // non-covered map vie (by header and menu tray)
    function getOptimalScale() {
        const size = map.getSize()
        const resolution = map.getView().getResolution()
        const widthMargin = store.state.ui.menuTrayWidth
        const heightMargin = store.state.ui.headerHeight
        const width = resolution * (size[0] - widthMargin * 2)
        const height = resolution * (size[1] - heightMargin * 2)
        const layoutSize = store.getters.mapSize
        const scaleWidth = (width * UNITS_RATIO * POINTS_PER_INCH) / layoutSize.width
        const scaleHeight = (height * UNITS_RATIO * POINTS_PER_INCH) / layoutSize.height
        let testScale = scaleWidth
        if (scaleHeight < testScale) {
            testScale = scaleHeight
        }
        const selectedLayoutScales = Array.from(store.state.print.selectedLayout.scales)
        // Make sure it's sorted descending
        selectedLayoutScales.sort((a, b) => b - a)
        // Find the first scale that is smaller than the testScale in descending order
        return selectedLayoutScales.find((scale) => scale < testScale)
    }
}
